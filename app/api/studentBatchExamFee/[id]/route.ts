//File  :/api/studentBatchExamFee/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Zod schema for validating the request body
const studentBatchExamFeeUpdateSchema = z.object({
  examFee: z.number().positive("Exam fee must be a positive number"),
  paymentStatus: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, collegeId } = session.user;

    if (role !== "FINANCE_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentBatchExamFeeId = params.id;

    if (!studentBatchExamFeeId) {
      return NextResponse.json(
        { error: "StudentBatchExamFee ID is required" },
        { status: 400 }
      );
    }

    // Check if the record exists and belongs to the college
    const existingRecord = await prisma.studentBatchExamFee.findUnique({
      where: { id: studentBatchExamFeeId },
      include: {
        studentBatch: {
          include: {
            batch: {
              include: {
                batchType: true,
              },
            },
          },
        },
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "StudentBatchExamFee not found" },
        { status: 404 }
      );
    }

    if (existingRecord.studentBatch.batch.batchType.collegeId !== collegeId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this record" },
        { status: 403 }
      );
    }

    // Delete the record
    await prisma.studentBatchExamFee.delete({
      where: { id: studentBatchExamFeeId },
    });

    return NextResponse.json(
      { message: "StudentBatchExamFee deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting StudentBatchExamFee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, collegeId, id: userId } = session.user;

    // if (role !== "FINANCE_MANAGER") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const studentBatchExamFeeId = params.id;

    if (!studentBatchExamFeeId) {
      return NextResponse.json(
        { error: "StudentBatchExamFee ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body using Zod
    const validationResult = studentBatchExamFeeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { examFee, paymentStatus, dueDate } = validationResult.data;

    // Check if the record exists and belongs to the college
    const existingRecord = await prisma.studentBatchExamFee.findUnique({
      where: { id: studentBatchExamFeeId },
      include: {
        studentBatch: {
          include: {
            batch: {
              include: {
                batchType: true,
              },
            },
          },
        },
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "StudentBatchExamFee not found" },
        { status: 404 }
      );
    }

    if (existingRecord.studentBatch.batch.batchType.collegeId !== collegeId) {
      return NextResponse.json(
        { error: "Unauthorized to update this record" },
        { status: 403 }
      );
    }

    // Update the record including updatedBy field
    // const updatedRecord = await prisma.studentBatchExamFee.update({
    //   where: { id: studentBatchExamFeeId },
    //   data: {
    //     examFee,
    //     updatedById: userId, // Updating the updatedBy field
    //   },
    // });

    // Prepare data for update
    const updateData: any = { updatedById: userId };
    if (examFee !== undefined) updateData.examFee = examFee;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);

    // Update the record
    const updatedRecord = await prisma.studentBatchExamFee.update({
      where: { id: studentBatchExamFeeId },
      data: updateData,
    });

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error) {
    console.error("Error updating StudentBatchExamFee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
