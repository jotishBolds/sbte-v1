//File : /api/studentOperations/[id]/batchMarks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json(
        { error: "batchId is required as a query parameter" },
        { status: 400 }
      );
    }

    // Check if the batch exists
    const batchExists = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batchExists) {
      return NextResponse.json(
        {
          error: "Batch not found",
          examMarks: [],
        },
        { status: 200 }
      );
    }

    // Fetch exam marks for the specific student and batch
    const examMarks = await prisma.examMark.findMany({
      where: {
        studentId,
        batchSubject: {
          batchId,
        },
      },
      include: {
        batchSubject: {
          include: {
            subject: true,
            batch: true,
          },
        },
        examType: true,
      },
    });

    // If no exam marks found, return an empty array instead of an error
    if (examMarks.length === 0) {
      return NextResponse.json(
        {
          error: "No exam marks found for the specified student and batch",
          examMarks: [],
        },
        { status: 200 }
      );
    }

    // Structure the response
    const response = examMarks.map((mark) => ({
      examMarkId: mark.id,
      subjectName: mark.batchSubject.subject.name,
      subjectCode: mark.batchSubject.subject.code,
      examType: mark.examType.examName,
      totalMarks: mark.examType.totalMarks,
      passingMarks: mark.examType.passingMarks,
      batchId: mark.batchSubject.batch.id,
      batchName: mark.batchSubject.batch.name,
      achievedMarks: mark.achievedMarks,
      wasAbsent: mark.wasAbsent,
      debarred: mark.debarred,
      malpractice: mark.malpractice,
      createdAt: mark.createdAt,
      updatedAt: mark.updatedAt,
    }));

    return NextResponse.json({ examMarks: response }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving exam marks:", error);
    return NextResponse.json(
      { error: "Internal Server Error", examMarks: [] },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
