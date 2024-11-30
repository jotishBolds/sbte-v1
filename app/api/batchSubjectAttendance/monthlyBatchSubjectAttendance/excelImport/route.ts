//File : /api/batchSubjectAttendance/monthlyBatchSubjectAttendance/excelImport/route.ts

import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";

const AttendanceSchema = z.object({
  enrollNo: z
    .string({
      required_error: "Enrollment Number are required.",
    })
    .min(1, "Enrollment number is required."),
  attendedTheoryClasses: z
    .number({
      required_error: "Attended theory classes are required.",
    })
    .nonnegative("Attended theory classes cannot be negative."),
  attendedPracticalClasses: z
    .number({
      required_error: "Attended theory classes are required.",
    })
    .nonnegative("Attended practical classes cannot be negative."),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const collegeId = session?.user?.collegeId;

    if (!collegeId) {
      return NextResponse.json(
        { error: "No college ID found in session" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const monthlyBatchSubjectClassesId = formData.get(
      "monthlyBatchSubjectClassesId"
    );

    if (!file || !monthlyBatchSubjectClassesId) {
      return NextResponse.json(
        { error: "File and monthlyBatchSubjectClassesId are required." },
        { status: 400 }
      );
    }

    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload an .xlsx file." },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    const jsonData: Array<{
      studentId: string;
      monthlyBatchSubjectClassesId: string;
      attendedTheoryClasses: number;
      attendedPracticalClasses: number;
    }> = [];
    const errorMessages: string[] = [];
    const missingStudents: number[] = [];
    const duplicateEntries: number[] = [];

    for (const row of worksheet.getRows(2, worksheet.rowCount - 1) || []) {
      if (!row.hasValues) continue;

      const rowData = {
        enrollNo: row.getCell("C").value?.toString().trim(),
        attendedTheoryClasses:
          row.getCell("D").value !== null &&
          row.getCell("D").value !== undefined
            ? Number(row.getCell("D").value)
            : NaN,
        attendedPracticalClasses:
          row.getCell("E").value !== null &&
          row.getCell("E").value !== undefined
            ? Number(row.getCell("E").value)
            : NaN,
      };

      // Validate row data
      const parseResult = AttendanceSchema.safeParse(rowData);
      if (!parseResult.success) {
        errorMessages.push(
          `Validation error in row ${row.number}: ${parseResult.error.errors
            .map((e) => e.message)
            .join(", ")}`
        );
        // Check if the error is specifically for enrollNo
        const isEnrollmentError = parseResult.error.errors.some(
          (e) => e.path[0] === "enrollNo"
        );

        // If it's an enrollment error, push the row number to the missingStudents array
        if (isEnrollmentError) {
          missingStudents.push(row.number);
        }
        continue;
      }

      // Fetch the student by enrollment number
      const student = await prisma.student.findUnique({
        where: { enrollmentNo: rowData.enrollNo },
      });

      if (!student) {
        missingStudents.push(row.number);
        continue;
      }

      // Check for duplicate entries in the database
      const existingRecord =
        await prisma.monthlyBatchSubjectAttendance.findUnique({
          where: {
            monthlyBatchSubjectClassesId_studentId: {
              monthlyBatchSubjectClassesId:
                monthlyBatchSubjectClassesId.toString(),
              studentId: student.id,
            },
          },
        });

      if (existingRecord) {
        duplicateEntries.push(row.number);
        continue;
      }

      // Prepare data for insertion
      jsonData.push({
        studentId: student.id,
        monthlyBatchSubjectClassesId: monthlyBatchSubjectClassesId.toString(),
        attendedTheoryClasses: rowData.attendedTheoryClasses,
        attendedPracticalClasses: rowData.attendedPracticalClasses,
      });
    }

    if (missingStudents.length > 0) {
      errorMessages.push(
        `Missing or invalid enrollment numbers in rows: ${missingStudents.join(
          ", "
        )}`
      );
    }

    if (duplicateEntries.length > 0) {
      errorMessages.push(
        `Duplicate entries found in rows: ${duplicateEntries.join(", ")}`
      );
    }

    if (errorMessages.length > 0) {
      return NextResponse.json(
        {
          errors: errorMessages,
          missingStudentRows: missingStudents,
          duplicateRows: duplicateEntries,
        },
        { status: 400 }
      );
    }

    // Batch insert attendance records
    await prisma.$transaction(
      jsonData.map((data) =>
        prisma.monthlyBatchSubjectAttendance.create({
          data,
        })
      )
    );

    return NextResponse.json(
      { message: "Attendance records imported successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing attendance import:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while importing attendance." },
      { status: 500 }
    );
  }
}
