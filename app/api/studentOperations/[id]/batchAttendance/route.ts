import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json(
        { error: "batchId is required as a query parameter" },
        { status: 400 }
      );
    }

    // Check if the batch exists
    const batchExists = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batchExists) {
      return NextResponse.json(
        {
          error: "Batch not found",
          monthlyAttendance: [],
          aggregatedAttendance: [],
        },
        { status: 200 }
      );
    }

    // Fetch attendance details
    const attendanceRecords =
      await prisma.monthlyBatchSubjectAttendance.findMany({
        where: {
          studentId,
          monthlyBatchSubjectClasses: {
            batchSubject: {
              batchId,
            },
          },
        },
        include: {
          monthlyBatchSubjectClasses: {
            include: {
              batchSubject: {
                include: {
                  subject: true,
                  batch: true,
                },
              },
            },
          },
        },
      });

    // If no attendance records found, return empty arrays
    if (attendanceRecords.length === 0) {
      return NextResponse.json(
        {
          error:
            "No attendance records found for the specified student and batch",
          monthlyAttendance: [],
          aggregatedAttendance: [],
        },
        { status: 200 }
      );
    }

    // Aggregate attendance data by subject
    const aggregatedAttendance: Record<string, any> = {};

    attendanceRecords.forEach((record) => {
      const monthlyClasses = record.monthlyBatchSubjectClasses;
      const batchSubject = monthlyClasses.batchSubject;
      const subjectId = batchSubject.subject.id;

      if (!aggregatedAttendance[subjectId]) {
        aggregatedAttendance[subjectId] = {
          subjectName: batchSubject.subject.name,
          subjectCode: batchSubject.subject.code,
          batchName: batchSubject.batch.name,
          batchId: batchSubject.batchId,
          totalTheoryClasses: 0,
          totalPracticalClasses: 0,
          completedTheoryClasses: 0,
          completedPracticalClasses: 0,
          attendedTheoryClasses: 0,
          attendedPracticalClasses: 0,
        };
      }

      aggregatedAttendance[subjectId].totalTheoryClasses +=
        monthlyClasses.totalTheoryClasses || 0;
      aggregatedAttendance[subjectId].totalPracticalClasses +=
        monthlyClasses.totalPracticalClasses || 0;
      aggregatedAttendance[subjectId].completedTheoryClasses +=
        monthlyClasses.completedTheoryClasses || 0;
      aggregatedAttendance[subjectId].completedPracticalClasses +=
        monthlyClasses.completedPracticalClasses || 0;
      aggregatedAttendance[subjectId].attendedTheoryClasses +=
        record.attendedTheoryClasses || 0;
      aggregatedAttendance[subjectId].attendedPracticalClasses +=
        record.attendedPracticalClasses || 0;
    });

    // Structure the response
    const response = {
      monthlyAttendance: attendanceRecords.map((record) => {
        const monthlyClasses = record.monthlyBatchSubjectClasses;
        const batchSubject = monthlyClasses.batchSubject;
        return {
          subjectName: batchSubject.subject.name,
          subjectCode: batchSubject.subject.code,
          month: monthlyClasses.month,
          monthlyTotalTheoryClasses: monthlyClasses.totalTheoryClasses,
          monthlyTotalPracticalClasses: monthlyClasses.totalPracticalClasses,
          monthlyCompletedTheoryClasses: monthlyClasses.completedTheoryClasses,
          monthlyCompletedPracticalClasses:
            monthlyClasses.completedPracticalClasses,
          monthlyAttendedTheoryClasses: record.attendedTheoryClasses,
          monthlyAttendedPracticalClasses: record.attendedPracticalClasses,
          batchName: batchSubject.batch.name,
          batchId: batchSubject.batchId,
        };
      }),
      aggregatedAttendance: Object.values(aggregatedAttendance),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error retrieving attendance records:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        monthlyAttendance: [],
        aggregatedAttendance: [],
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
