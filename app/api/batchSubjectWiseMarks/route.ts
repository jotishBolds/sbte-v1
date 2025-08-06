// File: /api/batchSubjectWiseMarks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      session.user?.role !== "HOD" &&
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "TEACHER" &&
      session.user?.role !== "SBTE_ADMIN" &&
      session.user?.role !== "EDUCATION_DEPARTMENT"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const batchSubjectId = searchParams.get("batchSubjectId");

    if (!batchSubjectId) {
      return NextResponse.json(
        { error: "Batch Subject ID is required in the URL parameter" },
        { status: 400 }
      );
    }

    const examMarks = await prisma.examMark.findMany({
      where: { batchSubjectId },
      include: {
        student: true,
        examType: true,
      },
    });

    if (examMarks.length === 0) {
      return NextResponse.json(
        { error: "No exam marks found for the specified BatchSubject" },
        { status: 404 }
      );
    }

    // Grouping marks by exam type and sorting by enrollment number
    const groupedMarks: Record<string, any[]> = {};

    examMarks.forEach((mark) => {
      const examType = mark.examType.examName;

      if (!groupedMarks[examType]) {
        groupedMarks[examType] = [];
      }

      groupedMarks[examType].push({
        examMarkId: mark.id,
        studentId: mark.student.id,
        studentName: mark.student.name,
        enrollmentNo: mark.student.enrollmentNo,
        totalMarks: mark.examType.totalMarks,
        passingMarks: mark.examType.passingMarks,
        achievedMarks: mark.achievedMarks,
        wasAbsent: mark.wasAbsent,
        debarred: mark.debarred,
        malpractice: mark.malpractice,
        createdAt: mark.createdAt,
        updatedAt: mark.updatedAt,
      });
    });

    // Sorting each exam type's students by enrollment number
    for (const examType in groupedMarks) {
      groupedMarks[examType].sort((a, b) =>
        a.enrollmentNo.localeCompare(b.enrollmentNo)
      );
    }

    return NextResponse.json({ examMarks: groupedMarks }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving exam marks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
