//File : app/api/studentBatchExamFee/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Validation schema for StudentBatchExamFee
const studentBatchExamFeeSchema = z.object({
  studentBatchId: z.string({
    required_error: "StudentBatch ID is required",
  }),
  reason: z
    .string({
      required_error: "Reason is required",
    })
    .min(1, "Reason must not be empty"),
  examFee: z
    .number({
      required_error: "Exam fee is required",
    })
    .positive("Exam fee must be a positive number"),
  dueDate: z
    .string({
      required_error: "Due date is required",
    })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
});

// POST API: Create a new StudentBatchExamFee
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "FINANCE_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = studentBatchExamFeeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { studentBatchId, reason, examFee, dueDate } = validationResult.data;
    const userId = session.user?.id;

    const studentBatchExists = await prisma.studentBatch.findUnique({
      where: { id: studentBatchId },
    });

    if (!studentBatchExists) {
      return NextResponse.json(
        { error: "StudentBatch not found" },
        { status: 404 }
      );
    }

    // Check for existing record with the same studentBatchId and reason
    const existingRecord = await prisma.studentBatchExamFee.findFirst({
      where: {
        studentBatchId,
        reason,
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          error:
            "A record with the same reason already exists for this StudentBatch",
        },
        { status: 409 } // Conflict status code
      );
    }
    const newStudentBatchExamFee = await prisma.studentBatchExamFee.create({
      data: {
        studentBatchId,
        reason,
        examFee,
        dueDate: dueDate ? new Date(dueDate) : undefined, // Ensure dueDate is stored as a valid Date object
        createdById: userId,
      },
    });

    return NextResponse.json(newStudentBatchExamFee, { status: 201 });
  } catch (error) {
    console.error("Error creating StudentBatchExamFee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET API: Retrieve all StudentBatchExamFee records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;

    // Ensure only authorized roles can access this data
    if (userRole !== "FINANCE_MANAGER" && userRole !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    // Build the query dynamically
    const whereClause: any = {};

    if (batchId) {
      const batchExists = await prisma.batch.findFirst({
        where: { id: batchId },
      });

      if (!batchExists) {
        return NextResponse.json({ error: "Batch not found" }, { status: 404 });
      }

      whereClause["studentBatch"] = { batchId };
    }

    const studentBatchExamFees = await prisma.studentBatchExamFee.findMany({
      where: whereClause,
      include: {
        studentBatch: {
          include: {
            student: true,
            batch: true,
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });

    if (!studentBatchExamFees || studentBatchExamFees.length === 0) {
      return NextResponse.json({ error: "No records found" }, { status: 404 });
    }

    // Transforming data for a cleaner response
    const responseData = studentBatchExamFees.map((fee) => ({
      id: fee.id,
      studentBatchId: fee.studentBatchId,
      reason: fee.reason,
      examFee: fee.examFee,
      dueDate: fee.dueDate,
      paymentStatus: fee.paymentStatus,
      createdAt: fee.createdAt,
      updatedAt: fee.updatedAt,
      createdBy: fee.createdBy
        ? {
            id: fee.createdBy.id,
            name: fee.createdBy.username,
          }
        : null,
      updatedBy: fee.updatedBy
        ? {
            id: fee.updatedBy.id,
            name: fee.updatedBy.username,
          }
        : null,
      student: {
        id: fee.studentBatch.student.id,
        name: fee.studentBatch.student.name,
      },
      batch: {
        id: fee.studentBatch.batch.id,
        name: fee.studentBatch.batch.name,
      },
    }));

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching StudentBatchExamFee records:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
