//File : /api/batchBaseExamFee/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Zod schema for validating the request body
const batchBaseExamFeeUpdateSchema = z.object({
  baseFee: z.number().positive("Fee must be a positive number"),
});

// DELETE API: Delete a BatchBaseExamFee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "FINANCE_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const batchBaseExamFeeId = params.id;

    if (!batchBaseExamFeeId) {
      return NextResponse.json(
        { error: "BatchBaseExamFee ID is required" },
        { status: 400 }
      );
    }

    // Check if the BatchBaseExamFee exists and belongs to the user's college
    const existingFee = await prisma.batchBaseExamFee.findUnique({
      where: { id: batchBaseExamFeeId },
      include: {
        batch: {
          include: {
            batchType: true,
          },
        },
      },
    });

    if (!existingFee) {
      return NextResponse.json(
        { error: "BatchBaseExamFee not found" },
        { status: 404 }
      );
    }

    if (existingFee.batch.batchType.collegeId !== session.user.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this BatchBaseExamFee" },
        { status: 403 }
      );
    }

    // Delete the BatchBaseExamFee
    await prisma.batchBaseExamFee.delete({
      where: { id: batchBaseExamFeeId },
    });

    return NextResponse.json(
      { message: "BatchBaseExamFee deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting BatchBaseExamFee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT API: Update the fee for a BatchBaseExamFee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "FINANCE_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const batchBaseExamfeeId = params.id;

    if (!batchBaseExamfeeId) {
      return NextResponse.json(
        { error: "BatchBaseExamFee ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body using Zod
    const validationResult = batchBaseExamFeeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { baseFee } = validationResult.data;

    // Check if the BatchBaseExamFee exists and belongs to the user's college
    const existingFee = await prisma.batchBaseExamFee.findUnique({
      where: { id: batchBaseExamfeeId },
      include: {
        batch: {
          include: {
            batchType: true,
          },
        },
      },
    });

    if (!existingFee) {
      return NextResponse.json(
        { error: "BatchBaseExamFee not found" },
        { status: 404 }
      );
    }

    if (existingFee.batch.batchType.collegeId !== session.user.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized to update this BatchBaseExamFee" },
        { status: 403 }
      );
    }

    // Update the fee
    const updatedFee = await prisma.batchBaseExamFee.update({
      where: { id: batchBaseExamfeeId },
      data: { baseFee },
    });

    return NextResponse.json(updatedFee, { status: 200 });
  } catch (error) {
    console.error("Error updating BatchBaseExamFee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET API: Fetch a BatchBaseExamFee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;
    const collegeId = session.user?.collegeId;

    if (userRole !== "FINANCE_MANAGER" && userRole !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const batchBaseExamFeeId = params.id;

    if (!batchBaseExamFeeId) {
      return NextResponse.json(
        { error: "BatchBaseExamFee ID is required" },
        { status: 400 }
      );
    }

    // Fetch the BatchBaseExamFee record by ID and check its college association
    const batchBaseExamFee = await prisma.batchBaseExamFee.findUnique({
      where: { id: batchBaseExamFeeId },
      include: {
        batch: {
          include: {
            batchType: true,
          },
        },
      },
    });

    if (!batchBaseExamFee) {
      return NextResponse.json(
        { error: "BatchBaseExamFee not found" },
        { status: 404 }
      );
    }

    if (batchBaseExamFee.batch.batchType.collegeId !== collegeId) {
      return NextResponse.json(
        { error: "Unauthorized to access this BatchBaseExamFee" },
        { status: 403 }
      );
    }

    return NextResponse.json(batchBaseExamFee, { status: 200 });
  } catch (error) {
    console.error("Error fetching BatchBaseExamFee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
