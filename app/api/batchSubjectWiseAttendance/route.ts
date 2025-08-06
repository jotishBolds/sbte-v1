//File : /api/batchSubjectWiseAttendance/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has appropriate role
    if (
      session.user?.role !== "HOD" &&
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "TEACHER" &&
      session.user?.role !== "SBTE_ADMIN" &&
      session.user?.role !== "EDUCATION_DEPARTMENT"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const batchSubjectId = searchParams.get("batchSubjectId");

    if (!batchSubjectId) {
      return NextResponse.json(
        { error: "batchSubjectId is required as a query parameter" },
        { status: 400 }
      );
    }

    const attendanceRecords =
      await prisma.monthlyBatchSubjectAttendance.findMany({
        where: {
          monthlyBatchSubjectClasses: {
            batchSubjectId,
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              enrollmentNo: true,
            },
          },
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
        orderBy: {
          studentId: "asc",
        },
      });

    if (attendanceRecords.length === 0) {
      return NextResponse.json(
        {
          error: "No attendance records found for the specified batch subject",
        },
        { status: 404 }
      );
    }

    // Structure response per student
    const studentAttendanceMap: Record<string, any> = {};

    attendanceRecords.forEach((record) => {
      const { student, attendedTheoryClasses, attendedPracticalClasses } =
        record;
      const { batchSubject } = record.monthlyBatchSubjectClasses;
      const studentId = student.id;

      if (!studentAttendanceMap[studentId]) {
        studentAttendanceMap[studentId] = {
          studentId: student.id,
          studentName: student.name,
          enrollmentNo: student.enrollmentNo,
          batchName: batchSubject.batch.name,
          batchId: batchSubject.batchId,
          subjectName: batchSubject.subject.name,
          subjectCode: batchSubject.subject.code,
          monthlyAttendance: [],
          aggregatedAttendance: {
            totalTheoryClasses: 0,
            totalPracticalClasses: 0,
            completedTheoryClasses: 0,
            completedPracticalClasses: 0,
            attendedTheoryClasses: 0,
            attendedPracticalClasses: 0,
            theoryAttendancePercentage: "N/A",
            practicalAttendancePercentage: "N/A",
          },
        };
      }

      // Add monthly attendance
      studentAttendanceMap[studentId].monthlyAttendance.push({
        month: record.monthlyBatchSubjectClasses.month,
        monthlyTotalTheoryClasses:
          record.monthlyBatchSubjectClasses.totalTheoryClasses,
        monthlyTotalPracticalClasses:
          record.monthlyBatchSubjectClasses.totalPracticalClasses,
        monthlyCompletedTheoryClasses:
          record.monthlyBatchSubjectClasses.completedTheoryClasses,
        monthlyCompletedPracticalClasses:
          record.monthlyBatchSubjectClasses.completedPracticalClasses,
        monthlyAttendedTheoryClasses: attendedTheoryClasses,
        monthlyAttendedPracticalClasses: attendedPracticalClasses,
      });

      // Aggregating overall attendance
      studentAttendanceMap[studentId].aggregatedAttendance.totalTheoryClasses +=
        record.monthlyBatchSubjectClasses.totalTheoryClasses || 0;
      studentAttendanceMap[
        studentId
      ].aggregatedAttendance.totalPracticalClasses +=
        record.monthlyBatchSubjectClasses.totalPracticalClasses || 0;
      studentAttendanceMap[
        studentId
      ].aggregatedAttendance.completedTheoryClasses +=
        record.monthlyBatchSubjectClasses.completedTheoryClasses || 0;
      studentAttendanceMap[
        studentId
      ].aggregatedAttendance.completedPracticalClasses +=
        record.monthlyBatchSubjectClasses.completedPracticalClasses || 0;
      studentAttendanceMap[
        studentId
      ].aggregatedAttendance.attendedTheoryClasses +=
        attendedTheoryClasses || 0;
      studentAttendanceMap[
        studentId
      ].aggregatedAttendance.attendedPracticalClasses +=
        attendedPracticalClasses || 0;
    });

    // Calculate attendance percentages
    Object.values(studentAttendanceMap).forEach((student: any) => {
      student.aggregatedAttendance.theoryAttendancePercentage =
        student.aggregatedAttendance.totalTheoryClasses > 0
          ? (
              (student.aggregatedAttendance.attendedTheoryClasses /
                student.aggregatedAttendance.totalTheoryClasses) *
              100
            ).toFixed(2)
          : "N/A";
      student.aggregatedAttendance.practicalAttendancePercentage =
        student.aggregatedAttendance.totalPracticalClasses > 0
          ? (
              (student.aggregatedAttendance.attendedPracticalClasses /
                student.aggregatedAttendance.totalPracticalClasses) *
              100
            ).toFixed(2)
          : "N/A";
    });

    // Convert object to array for response
    return NextResponse.json(Object.values(studentAttendanceMap), {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving attendance records:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
