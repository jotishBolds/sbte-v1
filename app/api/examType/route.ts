//File : /api/examType/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const examTypeSchema = z
  .object({
    examName: z.string(),
    totalMarks: z.number(),
    passingMarks: z.number().optional(),
    status: z.boolean().optional().default(true),
  })
  .refine(
    (data) => data.passingMarks == null || data.passingMarks < data.totalMarks,
    {
      message: "Passing marks must be less than total marks",
      path: ["passingMarks"],
    }
  );
// POST - Create a new ExamType
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the role "COLLEGE_SUPER_ADMIN"
    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    const body = await request.json();
    const validationResult = examTypeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }
    if (!collegeId) {
      return NextResponse.json(
        { error: "College not found in the session" },
        { status: 404 }
      );
    }

    // Check if the college exists
    const collegeExists = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!collegeExists) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const { examName, totalMarks, passingMarks, status } =
      validationResult.data;

    // Check if an ExamType with the same name already exists for the same college
    const existingExamType = await prisma.examType.findFirst({
      where: {
        examName: examName,
        collegeId: collegeId,
      },
    });

    if (existingExamType) {
      return NextResponse.json(
        { error: "An exam type with this name already exists for the college" },
        { status: 409 }
      );
    }
    const newExamType = await prisma.examType.create({
      data: {
        examName,
        totalMarks,
        passingMarks,
        status,
        collegeId,
      },
    });

    return NextResponse.json(newExamType, { status: 201 });
  } catch (error) {
    console.error("Error creating ExamType:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Retrieve ExamTypes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "College not found in the session" },
        { status: 404 }
      );
    }

    // Check if the college exists
    const collegeExists = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!collegeExists) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const examTypes = await prisma.examType.findMany({
      where: { collegeId },
      orderBy: { createdAt: "desc" },
    });

    if (examTypes.length === 0) {
      return NextResponse.json(
        { message: "No exam types found" },
        { status: 200 }
      );
    }

    return NextResponse.json(examTypes, { status: 200 });
  } catch (error) {
    console.error("Error fetching ExamTypes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
