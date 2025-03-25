//File : /api/monthlyBatchSubjectClasses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const monthlyBatchSubjectClassesSchema = z.object({
  batchSubjectId: z.string({ message: "Batch Subject ID is required" }),
  month: z.enum([
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ]),
  totalTheoryClasses: z
    .number()
    .int()
    .min(0, "Total Theory Classes must be a non-negative integer")
    .optional(),
  totalPracticalClasses: z
    .number()
    .int()
    .min(0, "Total Practical Classes must be a non-negative integer")
    .optional(),
  completedTheoryClasses: z
    .number()
    .int()
    .min(0, "Completed Theory Classes must be a non-negative integer")
    .optional(),
  completedPracticalClasses: z
    .number()
    .int()
    .min(0, "Completed Practical Classes must be a non-negative integer")
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if (session.user?.role !== "COLLEGE_SUPER_ADMIN" && "TEACHER") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const body = await request.json();
    const validationResult = monthlyBatchSubjectClassesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      batchSubjectId,
      month,
      totalTheoryClasses,
      totalPracticalClasses,
      completedTheoryClasses,
      completedPracticalClasses,
    } = validationResult.data;

    // Check if batchSubjectId exists
    const batchSubjectExists = await prisma.batchSubject.findUnique({
      where: { id: batchSubjectId },
    });

    if (!batchSubjectExists) {
      return NextResponse.json(
        { error: "Invalid batchSubjectId: BatchSubject not found" },
        { status: 404 }
      );
    }

    // Check for duplicate
    const existingEntry = await prisma.monthlyBatchSubjectClasses.findUnique({
      where: { batchSubjectId_month: { batchSubjectId, month } },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Entry for this batch subject and month already exists" },
        { status: 409 }
      );
    }

    const newMonthlyBatchSubjectClasses =
      await prisma.monthlyBatchSubjectClasses.create({
        data: {
          batchSubjectId,
          month,
          totalTheoryClasses,
          totalPracticalClasses,
          completedTheoryClasses,
          completedPracticalClasses,
        },
      });

    return NextResponse.json(newMonthlyBatchSubjectClasses, { status: 201 });
  } catch (error) {
    console.error("Error creating MonthlyBatchSubjectClasses:", error);
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

    const collegeId = session.user.collegeId;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json({ error: "Invalid collegeId" }, { status: 404 });
    }

    const batchSubjectId = request.nextUrl.searchParams.get("batchSubjectId");
    const month = request.nextUrl.searchParams.get("month");

    let filter: any = {};

    if (session.user.role === "TEACHER") {
      // Fetch the teacher using userId
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 }
        );
      }

      // Fetch batch subjects assigned to the teacher
      const assignedBatchSubjects =
        await prisma.teacherAssignedSubject.findMany({
          where: { teacherId: teacher.id },
          select: { batchSubjectId: true },
        });

      const assignedBatchSubjectIds = assignedBatchSubjects.map(
        (bs) => bs.batchSubjectId
      );

      if (assignedBatchSubjectIds.length === 0) {
        return NextResponse.json(
          { message: "No assigned subjects found for this teacher" },
          { status: 200 }
        );
      }

      // Filter records where batchSubjectId is in the assigned batch subjects
      filter.batchSubjectId = { in: assignedBatchSubjectIds };
    }

    if (batchSubjectId) filter.batchSubjectId = batchSubjectId;
    if (month) filter.month = month;

    // Ensure only classes related to the college are fetched
    filter.batchSubject = {
      batch: {
        program: {
          department: {
            collegeId: collegeId,
          },
        },
      },
    };

    // Fetch records based on filters
    const monthlyBatchSubjectClasses =
      await prisma.monthlyBatchSubjectClasses.findMany({
        where: filter,
        include: {
          batchSubject: {
            include: {
              subject: true,
              batch: true,
              subjectType: true,
            },
          },
        },
        orderBy: { month: "asc" },
      });

    if (monthlyBatchSubjectClasses.length === 0) {
      return NextResponse.json(
        { message: "No records found for MonthlyBatchSubjectClasses" },
        { status: 200 }
      );
    }

    return NextResponse.json(monthlyBatchSubjectClasses, { status: 200 });
  } catch (error) {
    console.error("Error fetching MonthlyBatchSubjectClasses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
