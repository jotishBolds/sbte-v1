//File : /api/batchBaseExamFee/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Validation schema for BatchBaseExamFee
const batchBaseExamFeeSchema = z.object({
  batchId: z.string({
    required_error: "Batch ID is required",
  }),
  baseFee: z
    .number({
      required_error: "Base fee is required",
    })
    .positive("Base fee must be a positive number"),
});

// POST API: Create a new BatchBaseExamFee
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      session.user?.role !== "FINANCE_MANAGER" &&
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "SBTE_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = batchBaseExamFeeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const collegeId = session.user.collegeId;

    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    // Ensure batch exists and belongs to the user's college
    const batchBelongsToCollege = await prisma.batch.findFirst({
      where: {
        id: data.batchId,
        batchType: {
          collegeId: collegeId,
        },
      },
      include: {
        batchType: true,
      },
    });

    if (!batchBelongsToCollege) {
      return NextResponse.json(
        { error: "Batch not found or does not belong to the user's college" },
        { status: 404 }
      );
    }

    // Check if a base exam fee is already assigned to this batch
    const existingBaseExamFee = await prisma.batchBaseExamFee.findFirst({
      where: { batchId: data.batchId },
    });

    if (existingBaseExamFee) {
      return NextResponse.json(
        { error: "A base exam fee is already assigned to this batch" },
        { status: 409 }
      );
    }

    const newBatchBaseExamFee = await prisma.batchBaseExamFee.create({
      data,
    });

    return NextResponse.json(newBatchBaseExamFee, { status: 201 });
  } catch (error) {
    console.error("Error creating BatchBaseExamFee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET API: Retrieve all BatchBaseExamFee records for a specific college
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;
    const collegeId = session.user?.collegeId;

    // Only FINANCE_MANAGER, COLLEGE_SUPER_ADMIN, and SBTE_ADMIN roles are allowed
    if (
      userRole !== "FINANCE_MANAGER" &&
      userRole !== "COLLEGE_SUPER_ADMIN" &&
      userRole !== "SBTE_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    // Fetch BatchBaseExamFee records associated with the user's college
    const batchBaseExamFees = await prisma.batchBaseExamFee.findMany({
      where: {
        batch: {
          batchType: {
            collegeId: collegeId,
          },
          program: {
            department: {
              collegeId: collegeId, // Add this to ensure it's within the same college
            },
          },
        },
      },
      include: {
        batch: {
          include: {
            program: true,
            academicYear: true,
            term: true,
            batchType: true,
          },
        },
      },
    });

    // if (!batchBaseExamFees || batchBaseExamFees.length === 0) {
    //   return NextResponse.json(
    //     { error: "No records found for the college" },
    //     { status: 404 }
    //   );
    // }

    return NextResponse.json(batchBaseExamFees, { status: 200 });
  } catch (error) {
    console.error("Error fetching BatchBaseExamFee records:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
