//File : /api/batchSubjectAttendance/monthlyBatchSubjectAttendance/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

async function checkCollegeAccess(
  monthlyBatchSubjectAttendanceId: string, // Added explicit type
  sessionCollegeId: string | undefined // sessionCollegeId may be undefined
) {
  const monthlyBatchSubjectAttendance =
    await prisma.monthlyBatchSubjectAttendance.findUnique({
      where: { id: monthlyBatchSubjectAttendanceId },
      include: {
        monthlyBatchSubjectClasses: {
          include: {
            batchSubject: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

  if (
    !monthlyBatchSubjectAttendance ||
    monthlyBatchSubjectAttendance.monthlyBatchSubjectClasses.batchSubject
      .subject.collegeId !== sessionCollegeId
  ) {
    return false;
  }
  return true;
}

export async function GET(
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

    const monthlyBatchSubjectAttendanceId = params.id;

    const attendance = await prisma.monthlyBatchSubjectAttendance.findUnique({
      where: { id: monthlyBatchSubjectAttendanceId },
      include: {
        monthlyBatchSubjectClasses: true, // Include related class details
        student: true, // Include student details
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { message: "Attendance record not found" },
        { status: 404 }
      );
    }

    if (
      !(await checkCollegeAccess(
        monthlyBatchSubjectAttendanceId,
        session.user.collegeId
      ))
    ) {
      return NextResponse.json(
        { error: "Forbidden: College mismatch" },
        { status: 403 }
      );
    }

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    console.error("Error fetching MonthlyBatchSubjectAttendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    const monthlyBatchSubjectAttendanceId = params.id;

    if (
      !(await checkCollegeAccess(
        monthlyBatchSubjectAttendanceId,
        session.user.collegeId
      ))
    ) {
      return NextResponse.json(
        { error: "Forbidden: College mismatch" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define schema for validation
    const updateSchema = z.object({
      attendedTheoryClasses: z.number().optional(),
      attendedPracticalClasses: z.number().optional(),
    });

    // Validate request body
    const validatedData = updateSchema.parse(body);

    // Fetch the associated MonthlyBatchSubjectClasses
    const attendance = await prisma.monthlyBatchSubjectAttendance.findUnique({
      where: { id: monthlyBatchSubjectAttendanceId },
      include: {
        monthlyBatchSubjectClasses: true,
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    const { monthlyBatchSubjectClasses } = attendance;

    if (
      validatedData.attendedTheoryClasses &&
      monthlyBatchSubjectClasses.completedTheoryClasses !== null &&
      validatedData.attendedTheoryClasses >
        monthlyBatchSubjectClasses.completedTheoryClasses
    ) {
      return NextResponse.json(
        {
          error: `Attended theory classes cannot exceed completed theory classes of ${monthlyBatchSubjectClasses.completedTheoryClasses}.`,
        },
        { status: 400 }
      );
    }

    if (
      validatedData.attendedPracticalClasses &&
      monthlyBatchSubjectClasses.completedPracticalClasses !== null &&
      validatedData.attendedPracticalClasses >
        monthlyBatchSubjectClasses.completedPracticalClasses
    ) {
      return NextResponse.json(
        {
          error: `Attended practical classes cannot exceed completed practical classes of ${monthlyBatchSubjectClasses.completedPracticalClasses}.`,
        },
        { status: 400 }
      );
    }

    const updatedAttendance = await prisma.monthlyBatchSubjectAttendance.update(
      {
        where: { id: monthlyBatchSubjectAttendanceId },
        data: validatedData,
      }
    );

    return NextResponse.json(updatedAttendance, { status: 200 });
  } catch (error) {
    console.error("Error updating MonthlyBatchSubjectAttendance:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
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

    const monthlyBatchSubjectAttendanceId = params.id;

    // Fetch the associated MonthlyBatchSubjectClasses
    const attendance = await prisma.monthlyBatchSubjectAttendance.findUnique({
      where: { id: monthlyBatchSubjectAttendanceId },
      // include: {
      //   monthlyBatchSubjectClasses: true,
      // },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }
    if (
      !(await checkCollegeAccess(
        monthlyBatchSubjectAttendanceId,
        session.user.collegeId
      ))
    ) {
      return NextResponse.json(
        { error: "Forbidden: College mismatch" },
        { status: 403 }
      );
    }

    await prisma.monthlyBatchSubjectAttendance.delete({
      where: { id: monthlyBatchSubjectAttendanceId },
    });

    return NextResponse.json(
      { message: "Attendance record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting MonthlyBatchSubjectAttendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
