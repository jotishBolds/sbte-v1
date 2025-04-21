//File : /api/batch/[id]/students/[studentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, BatchStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema to validate batchStatus
const batchStatusSchema = z.object({
  batchStatus: z.nativeEnum(BatchStatus),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "FINANCE_MANAGER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: batchId, studentId } = params;
    const requestBody = await request.json();

    // Validate batchStatus using Zod
    const validationResult = batchStatusSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    const { batchStatus } = validationResult.data;

    // Check if the Batch exists
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Check if the Student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Find the student batch relation
    const studentBatch = await prisma.studentBatch.findFirst({
      where: { batchId, studentId },
    });
    if (!studentBatch) {
      return NextResponse.json(
        { error: "Student not found in this batch" },
        { status: 404 }
      );
    }

    // Update the batchStatus
    const updatedStudentBatch = await prisma.studentBatch.update({
      where: { id: studentBatch.id },
      data: { batchStatus },
    });

    return NextResponse.json(
      { message: "Batch status updated successfully", updatedStudentBatch },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating batch status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "FINANCE_MANAGER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: batchId, studentId } = params;

    // Check if the Batch exists
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Check if the Student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Find the student batch relation
    const studentBatch = await prisma.studentBatch.findFirst({
      where: { batchId, studentId },
    });
    if (!studentBatch) {
      return NextResponse.json(
        { error: "Student not found in this batch" },
        { status: 404 }
      );
    }

    // First delete all related StudentBatchExamFee records
    await prisma.studentBatchExamFee.deleteMany({
      where: { studentBatchId: studentBatch.id },
    });

    // Now delete the student from the batch
    await prisma.studentBatch.delete({
      where: { id: studentBatch.id },
    });

    return NextResponse.json(
      { message: "Student removed from batch successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing student from batch:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
