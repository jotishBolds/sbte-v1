//File : /api/studentOperations/[id]/batchExamFees/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unthorized" }, { status: 401 });
    }
    // if (!session.user || session.user.role != "STUDENT") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }
    const studentId = params.id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    // Fetch student batches and fees
    const studentBatches = await prisma.studentBatch.findMany({
      where: {
        studentId,
        ...(batchId && { batchId }), // Filter by batchId if provided
      },
      include: {
        batch: true,
        StudentBatchExamFee: true, // Include fees
      },
    });

    if (studentBatches.length === 0) {
      return NextResponse.json(
        { error: "No fees found for the student" },
        { status: 404 }
      );
    }

    // Structure response
    const response = studentBatches.map((studentBatch) => ({
      batchId: studentBatch.batchId,
      batchName: studentBatch.batch.name,
      fees: studentBatch.StudentBatchExamFee.map((fee) => ({
        id: fee.id,
        reason: fee.reason,
        examFee: fee.examFee,
        dueDate: fee.dueDate,
        paymentStatus: fee.paymentStatus,
        createdAt: fee.createdAt,
        updatedAt: fee.updatedAt,
      })),
    }));

    return NextResponse.json({ fees: response }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving Fees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
