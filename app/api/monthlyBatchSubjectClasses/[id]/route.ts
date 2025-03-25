//File : /api/monthlyBatchSubjectClasses/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const monthlyBatchSubjectClassesSchema = z.object({
  totalTheoryClasses: z.number().int().min(0).optional(),
  totalPracticalClasses: z.number().int().min(0).optional(),
  completedTheoryClasses: z.number().int().min(0).optional(),
  completedPracticalClasses: z.number().int().min(0).optional(),
});

async function checkCollegeAccess(
  monthlyBatchSubjectClassId: string, // Added explicit type
  sessionCollegeId: string | undefined // sessionCollegeId may be undefined
) {
  const monthlyBatchSubjectClass =
    await prisma.monthlyBatchSubjectClasses.findUnique({
      where: { id: monthlyBatchSubjectClassId },
      include: {
        batchSubject: {
          include: {
            subject: true,
          },
        },
      },
    });

  if (
    !monthlyBatchSubjectClass ||
    monthlyBatchSubjectClass.batchSubject.subject.collegeId !== sessionCollegeId
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
    if (session.user?.role !== "COLLEGE_SUPER_ADMIN" && "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const monthlyBatchSubjectClassId = params.id;

    // Fetch the specific record by ID
    const monthlyBatchSubjectClass =
      await prisma.monthlyBatchSubjectClasses.findUnique({
        where: { id: monthlyBatchSubjectClassId },
        include: {
          batchSubject: true, // Include related BatchSubject data if needed
        },
      });

    if (!monthlyBatchSubjectClass) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (
      !(await checkCollegeAccess(
        monthlyBatchSubjectClassId,
        session.user.collegeId
      ))
    ) {
      return NextResponse.json(
        { error: "Forbidden: College mismatch" },
        { status: 403 }
      );
    }

    return NextResponse.json(monthlyBatchSubjectClass, { status: 200 });
  } catch (error) {
    console.error("Error fetching MonthlyBatchSubjectClass by ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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
    if (session.user?.role !== "COLLEGE_SUPER_ADMIN" && "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const monthlyBatchSubjectClassId = params.id;

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

    // Check if the record exists
    const existingRecord = await prisma.monthlyBatchSubjectClasses.findUnique({
      where: { id: monthlyBatchSubjectClassId },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (
      !(await checkCollegeAccess(
        monthlyBatchSubjectClassId,
        session.user.collegeId
      ))
    ) {
      return NextResponse.json(
        { error: "Forbidden: College mismatch" },
        { status: 403 }
      );
    }

    // Check if there are any attendance records for this monthlyBatchSubjectClassId
    const attendanceRecords =
      await prisma.monthlyBatchSubjectAttendance.findMany({
        where: { monthlyBatchSubjectClassesId: monthlyBatchSubjectClassId },
      });

    if (attendanceRecords.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot update classes as attendance records exist for this batch subject.",
        },
        { status: 403 }
      );
    }

    const updatedData = validationResult.data;

    // Update the record
    const updatedRecord = await prisma.monthlyBatchSubjectClasses.update({
      where: { id: monthlyBatchSubjectClassId },
      data: updatedData,
    });

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error) {
    console.error("Error updating MonthlyBatchSubjectClass:", error);
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
    // if (session.user?.role !== "COLLEGE_SUPER_ADMIN" && "TEACHER") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const monthlyBatchSubjectClassId = params.id;

    // Check if the record exists
    const existingRecord = await prisma.monthlyBatchSubjectClasses.findUnique({
      where: { id: monthlyBatchSubjectClassId },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    if (
      !(await checkCollegeAccess(
        monthlyBatchSubjectClassId,
        session.user.collegeId
      ))
    ) {
      return NextResponse.json(
        { error: "Forbidden: College mismatch" },
        { status: 403 }
      );
    }

    // Delete the record
    await prisma.monthlyBatchSubjectClasses.delete({
      where: { id: monthlyBatchSubjectClassId },
    });

    return NextResponse.json(
      { message: "Record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting MonthlyBatchSubjectClass:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
