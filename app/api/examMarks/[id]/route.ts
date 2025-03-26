//File : /api/examMarks/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for validating request body in the PUT request
const examMarkUpdateSchema = z.object({
  achievedMarks: z.number().optional(),
  wasAbsent: z.boolean().optional(),
  debarred: z.boolean().optional(),
  malpractice: z.boolean().optional(),
});

// PUT - Update an existing ExamMark
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "College not found in the session" },
        { status: 404 }
      );
    }

    const examMarkId = params.id;
    const body = await request.json();
    const validationResult = examMarkUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Check if the ExamMark exists and belongs to the same college
    const existingExamMark = await prisma.examMark.findFirst({
      where: {
        id: examMarkId,
        batchSubject: {
          subject: {
            collegeId,
          },
        },
      },
      include: { batchSubject: true },
    });

    if (!existingExamMark) {
      return NextResponse.json(
        {
          error: "ExamMark not found or does not belong to the user's college",
        },
        { status: 404 }
      );
    }

    const { achievedMarks, wasAbsent, debarred, malpractice } =
      validationResult.data;

    // Retrieve the examType to get the totalMarks
    const examType = await prisma.examType.findUnique({
      where: { id: existingExamMark.examTypeId },
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
    if (achievedMarks) {
      if (achievedMarks > totalMarks) {
        return NextResponse.json(
          {
            error: `Achieved marks should not exceed the total marks of ${examType.totalMarks} in exam Type ${examType.examName}`,
          },
          { status: 400 }
        );
      }
    }

    const updatedExamMark = await prisma.examMark.update({
      where: { id: examMarkId },
      data: {
        achievedMarks,
        wasAbsent,
        debarred,
        malpractice,
      },
    });

    return NextResponse.json(updatedExamMark, { status: 200 });
  } catch (error) {
    console.error("Error updating ExamMark:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete an existing ExamMark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN" &&  session.user?.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "College not found in the session" },
        { status: 404 }
      );
    }

    const examMarkId = params.id;

    // Check if the ExamMark exists and belongs to the same college
    const existingExamMark = await prisma.examMark.findFirst({
      where: {
        id: examMarkId,
        batchSubject: {
          subject: {
            collegeId,
          },
        },
      },
    });

    if (!existingExamMark) {
      return NextResponse.json(
        {
          error: "ExamMark not found or does not belong to the user's college",
        },
        { status: 404 }
      );
    }

    await prisma.examMark.delete({
      where: { id: examMarkId },
    });

    return NextResponse.json(
      { message: "ExamMark deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting ExamMark:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
