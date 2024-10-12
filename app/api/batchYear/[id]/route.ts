//api/batchYear/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const batchYearSchema = z.object({
  year: z
    .number({
      required_error: "Year is required",
    })
    .int()
    .min(1900, "Year must be a valid year")
    .max(2100, "Year must be a valid year")
    .optional(), // Make year optional
  status: z.boolean().optional().default(true),
});

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
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = batchYearSchema.partial().safeParse(body);

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

    // Fetch existing batch year to ensure it belongs to the user's college
    const existingBatchYear = await prisma.batchYear.findFirst({
      where: {
        id: params.id,
        collegeId,
      },
    });

    if (!existingBatchYear) {
      return NextResponse.json(
        { error: "Batch year not found" },
        { status: 404 }
      );
    }

    // If updating the year, ensure it's unique within the college
    if (data.year) {
      const duplicateYear = await prisma.batchYear.findFirst({
        where: {
          year: data.year,
          collegeId,
          NOT: {
            id: params.id, // Exclude the current record from the check
          },
        },
      });

      if (duplicateYear) {
        return NextResponse.json(
          { error: "Batch year already exists for this college" },
          { status: 409 }
        );
      }
    }

    const updatedBatchYear = await prisma.batchYear.update({
      where: { id: params.id },
      data: {
        //   ...existingBatchYear,
        ...data,
      },
    });

    return NextResponse.json(updatedBatchYear, { status: 200 });
  } catch (error) {
    console.error("Error updating batch year:", error);
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
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    // Verify batch year exists and belongs to user's college
    const existingBatchYear = await prisma.batchYear.findFirst({
      where: {
        id: params.id,
        collegeId, // Ensures the batch year belongs to the same college
      },
    });

    if (!existingBatchYear) {
      return NextResponse.json(
        { error: "Batch year not found or does not belong to your college" },
        { status: 404 }
      );
    }

    await prisma.batchYear.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Batch year deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting batch year:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
