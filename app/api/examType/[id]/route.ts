//File : /api/examType/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for validating request body in the PUT request
const examTypeUpdateSchema = z.object({
  examName: z.string().optional(),
  totalMarks: z.number().optional(),
  passingMarks: z.number().optional(),
  status: z.boolean().optional(),
});

// PUT - Update an existing ExamType
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

    const examTypeId = params.id;
    const body = await request.json();
    const validationResult = examTypeUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Check if the ExamType exists and belongs to the same college
    const existingExamType = await prisma.examType.findFirst({
      where: { id: examTypeId, collegeId },
    });

    if (!existingExamType) {
      return NextResponse.json(
        { error: "ExamType not found" },
        { status: 404 }
      );
    }

    const { examName, totalMarks, passingMarks, status } =
      validationResult.data;

    // Convert existing totalMarks and passingMarks to number for comparison
    const existingTotalMarks = existingExamType.totalMarks.toNumber();
    const existingPassingMarks = existingExamType.passingMarks?.toNumber();
    // Check if only passingMarks is provided, validate against existing totalMarks
    if (passingMarks !== undefined && totalMarks === undefined) {
      if (passingMarks >= existingTotalMarks) {
        return NextResponse.json(
          { error: "Passing marks must be less than total marks" },
          { status: 400 }
        );
      }
    }

    // Check if only totalMarks is provided, validate against existing passingMarks
    if (totalMarks !== undefined && passingMarks === undefined) {
      if (
        existingPassingMarks !== undefined &&
        totalMarks <= existingPassingMarks
      ) {
        return NextResponse.json(
          { error: "Total marks must be greater than passing marks" },
          { status: 400 }
        );
      }
    }

    // If both passingMarks and totalMarks are provided, check the new values against each other
    if (passingMarks !== undefined && totalMarks !== undefined) {
      if (passingMarks >= totalMarks) {
        return NextResponse.json(
          { error: "Passing marks must be less than total marks" },
          { status: 400 }
        );
      }
    }

    const updatedExamType = await prisma.examType.update({
      where: { id: examTypeId },
      data: {
        examName,
        totalMarks,
        passingMarks,
        status,
      },
    });

    return NextResponse.json(updatedExamType, { status: 200 });
  } catch (error) {
    console.error("Error updating ExamType:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete an existing ExamType
export async function DELETE(
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

    const examTypeId = params.id;

    // Check if the ExamType exists and belongs to the same college
    const existingExamType = await prisma.examType.findFirst({
      where: { id: examTypeId, collegeId },
    });

    if (!existingExamType) {
      return NextResponse.json(
        { error: "ExamType not found" },
        { status: 404 }
      );
    }

    await prisma.examType.delete({
      where: { id: examTypeId },
    });

    return NextResponse.json(
      { message: "ExamType deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting ExamType:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
