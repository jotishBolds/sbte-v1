//api/batchYear/route.ts
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
    .max(2100, "Year must be a valid year"),
  status: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
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
    const validationResult = batchYearSchema.safeParse(body);

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

    // Check if batch year with the same year exists
    const existingBatchYear = await prisma.batchYear.findFirst({
      where: {
        year: data.year,
        collegeId,
      },
    });

    if (existingBatchYear) {
      return NextResponse.json(
        { error: "Batch year already exists for this college" },
        { status: 409 }
      );
    }

    const newBatchYear = await prisma.batchYear.create({
      data: {
        ...data,
        collegeId,
      },
    });

    return NextResponse.json(newBatchYear, { status: 201 });
  } catch (error) {
    console.error("Error creating batch year:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
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

    const batchYears = await prisma.batchYear.findMany({
      where: {
        collegeId,
      },
      orderBy: {
        year: "desc", // Sort by year in descending order
      },
    });

    if (!batchYears) {
      return NextResponse.json(
        { error: "Batch years not found" },
        { status: 200 }
      );
    }

    return NextResponse.json(batchYears, { status: 200 });
  } catch (error) {
    console.error("Error fetching batch years:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
