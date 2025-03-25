//File : /api/examMarks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const examMarkSchema = z
  .object({
    examTypeId: z.string(),
    studentId: z.string(),
    batchSubjectId: z.string(),
    achievedMarks: z.number().min(0),
    wasAbsent: z.boolean().optional().default(false),
    debarred: z.boolean().optional().default(false),
    malpractice: z.boolean().optional().default(false),
  })
  .refine((data) => !data.wasAbsent || data.achievedMarks === 0, {
    message: "If the student was absent, achieved marks must be 0.",
    path: ["achievedMarks"],
  });

// POST - Create a new ExamMark
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user.role !== "TEACHER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = examMarkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      examTypeId,
      studentId,
      batchSubjectId,
      achievedMarks,
      wasAbsent,
      debarred,
      malpractice,
    } = validationResult.data;

    // Validate studentId
    const studentExists = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Validate batchSubjectId
    const batchSubjectExists = await prisma.batchSubject.findUnique({
      where: { id: batchSubjectId },
    });

    if (!batchSubjectExists) {
      return NextResponse.json(
        { error: "Batch subject not found" },
        { status: 404 }
      );
    }

    // Retrieve the examType to get the totalMarks
    const examType = await prisma.examType.findUnique({
      where: { id: examTypeId },
      select: { totalMarks: true, examName: true },
    });

    if (!examType) {
      return NextResponse.json(
        { error: "Exam type not found" },
        { status: 404 }
      );
    }

    // Convert totalMarks to a number for comparison
    const totalMarks = examType.totalMarks.toNumber();
    if (achievedMarks > totalMarks) {
      return NextResponse.json(
        {
          error: `Achieved marks should not exceed the total marks of ${examType.totalMarks} in exam Type ${examType.examName}`,
        },
        { status: 400 }
      );
    }

    // Check for existing ExamMark to prevent duplicate entries
    const existingExamMark = await prisma.examMark.findUnique({
      where: {
        examTypeId_studentId_batchSubjectId: {
          examTypeId,
          studentId,
          batchSubjectId,
        },
      },
    });

    if (existingExamMark) {
      return NextResponse.json(
        {
          error:
            "Exam mark entry already exists for this exam, student, and batch subject combination",
        },
        { status: 409 }
      );
    }

    const newExamMark = await prisma.examMark.create({
      data: {
        examTypeId,
        studentId,
        batchSubjectId,
        achievedMarks,
        wasAbsent,
        debarred,
        malpractice,
      },
    });

    return NextResponse.json(newExamMark, { status: 201 });
  } catch (error) {
    console.error("Error creating ExamMark:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Retrieve ExamMarks for a specific college
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "College not found in the session" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    // const collegeIdParam = searchParams.get("collegeId");
    const batchSubjectIdParam = searchParams.get("batchSubjectId");
    if (!batchSubjectIdParam) {
      return NextResponse.json(
        { error: "batchSubjectId is required" },
        { status: 400 }
      );
    }

    // Verify that the batchSubject belongs to a subject within the college
    const batchSubject = await prisma.batchSubject.findUnique({
      where: { id: batchSubjectIdParam },
      include: { subject: true },
    });

    if (!batchSubject || batchSubject.subject.collegeId !== collegeId) {
      return NextResponse.json(
        { error: "BatchSubject does not belong to the user's college" },
        { status: 403 }
      );
    }

    // Retrieve exam marks for the specified batchSubjectId
    const examMarks = await prisma.examMark.findMany({
      where: { batchSubjectId: batchSubjectIdParam },
      include: {
        examType: true,
        student: true,
        batchSubject: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (examMarks.length === 0) {
      return NextResponse.json(
        { message: "No exam marks found for the specified batchSubjectId" },
        { status: 200 }
      );
    }

    return NextResponse.json(examMarks, { status: 200 });
  } catch (error) {
    console.error("Error fetching ExamMarks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
