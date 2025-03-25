//File : /api/monthlyBatchSubjectClasses/[id]/monthlyBatchSubjectAttendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const monthlyBatchSubjectAttendanceSchema = z.object({
  monthlyBatchSubjectClassesId: z.string({
    message: "Monthly Batch Subject Classes ID is required",
  }),
  studentId: z.string({ message: "Student ID is required" }),
  attendedTheoryClasses: z
    .number()
    .int()
    .min(0, "Attended Theory Classes must be a non-negative integer"),
  attendedPracticalClasses: z
    .number()
    .int()
    .min(0, "Attended Practical Classes must be a non-negative integer"),
});

// POST API: Create a new MonthlyBatchSubjectAttendance record
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
    const validationResult =
      monthlyBatchSubjectAttendanceSchema.safeParse(body);

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
      monthlyBatchSubjectClassesId,
      studentId,
      attendedTheoryClasses,
      attendedPracticalClasses,
    } = validationResult.data;

    // Check if the monthlyBatchSubjectClassesId exists
    const monthlyBatchSubjectClasses =
      await prisma.monthlyBatchSubjectClasses.findUnique({
        where: { id: monthlyBatchSubjectClassesId },
        include: {
          batchSubject: {
            select: {
              batchId: true,
            },
          },
        },
      });

    if (!monthlyBatchSubjectClasses) {
      return NextResponse.json(
        { error: "Invalid monthlyBatchSubjectClassesId: Not found" },
        { status: 404 }
      );
    }

    const batchId = monthlyBatchSubjectClasses.batchSubject.batchId;

    // Check if the student belongs to the batch with status IN_PROGRESS
    const studentInBatch = await prisma.studentBatch.findFirst({
      where: {
        studentId: studentId,
        batchId: batchId,
        batchStatus: "IN_PROGRESS",
      },
    });

    if (!studentInBatch) {
      return NextResponse.json(
        {
          error:
            "Student does not belong to the batch or batch is not in progress.",
        },
        { status: 400 }
      );
    }
    // Validate attendance against completed classes
    if (
      attendedTheoryClasses >
        (monthlyBatchSubjectClasses.completedTheoryClasses || 0) ||
      attendedPracticalClasses >
        (monthlyBatchSubjectClasses.completedPracticalClasses || 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Attended classes cannot exceed the completed classes for theory or practical.",
        },
        { status: 400 }
      );
    }

    // Check if the studentId exists
    const studentExists = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      return NextResponse.json(
        { error: "Invalid studentId: Student not found" },
        { status: 404 }
      );
    }

    // Check for duplicate
    const existingEntry = await prisma.monthlyBatchSubjectAttendance.findUnique(
      {
        where: {
          monthlyBatchSubjectClassesId_studentId: {
            monthlyBatchSubjectClassesId,
            studentId,
          },
        },
      }
    );

    if (existingEntry) {
      return NextResponse.json(
        { error: "Attendance record already exists for this student" },
        { status: 409 }
      );
    }

    const newAttendance = await prisma.monthlyBatchSubjectAttendance.create({
      data: {
        monthlyBatchSubjectClassesId,
        studentId,
        attendedTheoryClasses,
        attendedPracticalClasses,
      },
    });

    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error("Error creating MonthlyBatchSubjectAttendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET API: Fetch MonthlyBatchSubjectAttendance records
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check session for authorization
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the required role
    // if (session.user?.role !== "COLLEGE_SUPER_ADMIN" && "TEACHER") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Extract `id` from params
    const monthlyBatchSubjectClassesId = params.id;

    if (!monthlyBatchSubjectClassesId) {
      return NextResponse.json(
        { error: "Invalid request: Missing monthlyBatchSubjectClassesId" },
        { status: 400 }
      );
    }

    // Fetch attendance records for the specified class ID
    const attendances = await prisma.monthlyBatchSubjectAttendance.findMany({
      where: {
        monthlyBatchSubjectClassesId,
      },
      include: {
        monthlyBatchSubjectClasses: true, // Include related class details if needed
        student: true, // Include related student details if needed
      },
      orderBy: { createdAt: "desc" }, // Sort by creation date
    });

    if (attendances.length === 0) {
      return NextResponse.json(
        { message: "No attendance records found" },
        { status: 200 }
      );
    }

    return NextResponse.json(attendances, { status: 200 });
  } catch (error) {
    console.error("Error fetching MonthlyBatchSubjectAttendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
