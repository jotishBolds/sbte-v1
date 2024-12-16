//api/teacherDesignation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define Zod schema for Designation
const designationSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  alias: z
    .string()
    .min(1, "Alias must be at least 1 characters")
    .max(50, "Alias must be less than 50 characters"),
  description: z.string().optional(),
});

// POST: Create new Designation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user.role !== "ADM"
    )
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const collegeId = session.user.collegeId;
    if (!collegeId)
      return NextResponse.json(
        { error: "User not associated with a college" },
        { status: 400 }
      );

    const body = await request.json();
    const validationResult = designationSchema.safeParse(body);
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

    // Check if Designation with same name or alias already exists in the college
    const existingDesignation = await prisma.designation.findFirst({
      where: {
        OR: [{ name: data.name }, { alias: data.alias }],
        collegeId,
      },
    });

    if (existingDesignation) {
      return NextResponse.json(
        { error: "Designation with this name or alias already exists" },
        { status: 409 }
      );
    }

    // Create new Designation
    const newDesignation = await prisma.designation.create({
      data: {
        ...data,
        collegeId,
      },
    });

    return NextResponse.json(newDesignation, { status: 201 });
  } catch (error) {
    console.error("Error creating designation:", error);
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
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "TEACHER" &&
      session.user.role !== "ADM"
    )
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const collegeId = session.user.collegeId;
    if (!collegeId)
      return NextResponse.json(
        { error: "User not associated with a college" },
        { status: 400 }
      );

    const designations = await prisma.designation.findMany({
      where: { collegeId },
    });

    return NextResponse.json(designations, { status: 200 });
  } catch (error) {
    console.error("Error fetching designations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
