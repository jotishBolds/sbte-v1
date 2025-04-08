//File : /app/api/gradeCard/calculateExternal/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user?.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "No college ID in session" },
        { status: 400 }
      );
    }

    const { batchId } = await req.json();
    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      );
    }

    const batchSubjects = await prisma.batchSubject.findMany({
      where: { batchId },
      include: {
        subject: true,
        batch: {
          include: { term: true },
        },
      },
    });

    if (!batchSubjects.length) {
      return NextResponse.json(
        { error: "No batch subjects found for the batch." },
        { status: 404 }
      );
    }

    const errorMessages: string[] = [];
    const updates: {
      studentGradeCardId: string;
      batchSubjectId: string;
      externalMarks: number;
    }[] = [];

    for (const batchSubject of batchSubjects) {
      const latestSemesterExamType = await prisma.examType.findFirst({
        where: {
          collegeId,
          examName: {
            contains: "semester",
            mode: "insensitive",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!latestSemesterExamType) {
        // ID: ${batchSubject.id}
        errorMessages.push(
          `No semester exam found for batchSubject ${batchSubject.subject.name} (${batchSubject.subject.code})`
        );
        continue;
      }

      const examMarks = await prisma.examMark.findMany({
        where: {
          batchSubjectId: batchSubject.id,
          examTypeId: latestSemesterExamType.id,
        },
        include: {
          student: { select: { id: true } },
        },
      });

      const studentBatches = await prisma.studentBatch.findMany({
        where: { batchId },
        select: { studentId: true },
      });

      const allStudentIdsInBatch = studentBatches.map((sb) => sb.studentId);
      const studentsWithMarks = new Set(
        examMarks.map((mark) => mark.student.id)
      );

      for (const studentId of allStudentIdsInBatch) {
        if (!studentsWithMarks.has(studentId)) {
          const student = await prisma.student.findUnique({
            where: { id: studentId },
          });
          if (!student) {
            errorMessages.push(`Student not found for studentId: ${studentId}`);
            continue;
          }
          errorMessages.push(
            `Missing semester exam marks for student ${student.name} with ER No. ${student.enrollmentNo} in ${batchSubject.subject.name} (${batchSubject.subject.code})`
          );
        }
      }

      const fullMarks = latestSemesterExamType.totalMarks.toNumber();

      for (const mark of examMarks) {
        const { studentId, achievedMarks } = mark;
        const externalMarks = Math.round(
          (achievedMarks.toNumber() / fullMarks) * 70
        );
        console.log(studentId, " ", batchId, " ", batchSubject.batch.termId);
        const studentGradeCard = await prisma.studentGradeCard.findFirst({
          where: {
            studentId,
            batchId,
            semesterId: batchSubject.batch.termId,
          },
        });

        if (!studentGradeCard) {
          const student = await prisma.student.findUnique({
            where: { id: studentId },
          });
          if (!student) {
            errorMessages.push(`Student not found for studentId: ${studentId}`);
            continue;
          }
          errorMessages.push(
            `Grade card not found for student ${student.name} - ${student.enrollmentNo} for ${batchSubject.batch.term.name}, ${batchSubject.subject.name} (${batchSubject.subject.code})`
          );
          continue;
        }

        const internalMarkExists = await prisma.subjectGradeDetail.findFirst({
          where: {
            studentGradeCardId: studentGradeCard.id,
            batchSubjectId: batchSubject.id,
            internalMarks: {
              not: null,
            },
          },
        });

        if (!internalMarkExists) {
          const student = await prisma.student.findUnique({
            where: { id: studentId },
          });
          if (!student) {
            errorMessages.push(`Student not found for studentId: ${studentId}`);
            continue;
          }

          errorMessages.push(
            `Internal mark missing for student ${student.name} - ${student.enrollmentNo} for Batch Subject ${batchSubject.subject.name} (${batchSubject.subject.code})`
          );
          continue;
        }

        updates.push({
          studentGradeCardId: studentGradeCard.id,
          batchSubjectId: batchSubject.id,
          externalMarks,
        });
      }
    }

    if (errorMessages.length > 0) {
      return NextResponse.json(
        {
          message: "Errors occurred during external marks calculation.",
          errors: errorMessages,
        },
        { status: 400 }
      );
    }

    for (const update of updates) {
      await prisma.subjectGradeDetail.updateMany({
        where: {
          studentGradeCardId: update.studentGradeCardId,
          batchSubjectId: update.batchSubjectId,
        },
        data: {
          externalMarks: update.externalMarks,
        },
      });
    }

    return NextResponse.json(
      { message: "External marks updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error calculating external marks:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate external marks.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
