//File: /api/examMarks/excelImport/route.ts

import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import { z } from "zod";
import { bulkInsert, BulkOperationProgress } from "@/lib/bulk-operation-utils";

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const ExamMarkSchema = z.object({
  // studentName: z.string().min(1, "Student name is required."),
  enrollNo: z.string().min(1, "Enrollment number is required."),
  achievedMarks: z
    .number()
    .nonnegative("Achieved marks cannot be less than 0."),
  wasAbsent: z.boolean().optional(),
  debarred: z.boolean().optional(),
  malpractice: z.boolean().optional(),
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
    const examTypeId = formData.get("examTypeId");
    const batchSubjectId = formData.get("batchSubjectId");

    if (!file || !examTypeId || !batchSubjectId) {
      return NextResponse.json(
        { error: "File, examTypeId, and batchSubjectId are required." },
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

    // Fetch the exam type to get totalMarks
    const examType = await prisma.examType.findUnique({
      where: { id: examTypeId.toString() },
    });

    if (!examType) {
      return NextResponse.json(
        { error: "Invalid exam type ID." },
        { status: 400 }
      );
    }

    // Fetch the batch Subject
    const batchSubject = await prisma.batchSubject.findUnique({
      where: { id: batchSubjectId.toString() },
    });

    if (!examType) {
      return NextResponse.json(
        { error: "Invalid batch subject  ID." },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    const jsonData = [];
    const errorMessages = [];
    const missingStudentIds = [];
    const existingRows = [];
    const exceededMarksRows = [];
    const missingStudents: number[] = [];

    for (const row of worksheet.getRows(2, worksheet.rowCount - 1) || []) {
      if (!row.hasValues) continue; // Skip rows with no values

      const rowData = {
        studentName: row.getCell("B").value?.toString(),
        enrollNo: row.getCell("C").value?.toString().trim(),
        achievedMarks: Number(row.getCell("D").value) || 0, // Safely convert to number
        wasAbsent: row.getCell("E").value?.toString().trim() === "Yes",
        debarred: row.getCell("F").value?.toString().trim() === "Yes",
        malpractice: row.getCell("G").value?.toString().trim() === "Yes",
      };

      // Validate rowData against the Zod schema
      const parseResult = ExamMarkSchema.safeParse(rowData);
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

      // Fetch student ID by enrollment number
      const student = await prisma.student.findUnique({
        where: { enrollmentNo: rowData.enrollNo },
      });

      if (!student) {
        missingStudentIds.push(row.number);
        continue;
      }

      // Check if achievedMarks is less than totalMarks
      if (rowData.achievedMarks > parseFloat(examType.totalMarks.toString())) {
        exceededMarksRows.push(row.number);
        errorMessages.push(
          // `Achieved marks in row ${row.number} exceed the total marks for this exam type.`
          `Achieved marks should not exceed the total marks of ${examType.totalMarks} in exam Type ${examType.examName}`
        );
        continue;
      }

      // Check for existing record
      const existingRecord = await prisma.examMark.findUnique({
        where: {
          examTypeId_studentId_batchSubjectId: {
            examTypeId: examTypeId.toString(),
            studentId: student.id,
            batchSubjectId: batchSubjectId.toString(),
          },
        },
      });

      if (existingRecord) {
        existingRows.push(row.number);
        continue;
      }

      // Prepare data for insertion
      jsonData.push({
        studentId: student.id, // Use fetched student ID
        batchSubjectId: batchSubjectId.toString(),
        examTypeId: examTypeId.toString(),
        achievedMarks: rowData.achievedMarks,
        wasAbsent: rowData.wasAbsent,
        debarred: rowData.debarred,
        malpractice: rowData.malpractice,
      });
    }

    if (missingStudents.length > 0) {
      errorMessages.push(
        `Missing or invalid enrollment numbers in rows: ${missingStudents.join(
          ", "
        )}`
      );
    }

    if (missingStudentIds.length > 0) {
      errorMessages.push(
        `Missing or invalid student enrollment numbers in rows: ${missingStudentIds.join(
          ", "
        )}`
      );
    }

    if (existingRows.length > 0) {
      errorMessages.push(
        `Existing entries found in rows: ${existingRows.join(", ")}`
      );
    }

    if (errorMessages.length > 0) {
      return NextResponse.json(
        {
          errors: errorMessages,
          missingRows: missingStudentIds,
          existingRows,
          exceededMarksRows,
        },
        { status: 400 }
      );
    }

    // Use bulk operations for efficient processing
    console.log(`Starting bulk import of ${jsonData.length} exam marks`);

    // Initialize progress tracking
    const progress = new BulkOperationProgress(jsonData.length, (info) => {
      console.log(
        `Exam marks import progress: ${info.percentage}% (${info.completed}/${info.total})`
      );
    });

    // Define the bulk insert function
    const insertExamMark = async (data: any) => {
      return await prisma.examMark.create({
        data: {
          studentId: data.studentId,
          batchSubjectId: data.batchSubjectId,
          examTypeId: data.examTypeId,
          achievedMarks: data.achievedMarks,
          wasAbsent: data.wasAbsent,
          debarred: data.debarred,
          malpractice: data.malpractice,
        },
      });
    };

    // Execute bulk insert with optimized settings
    const result = await bulkInsert(jsonData, insertExamMark, {
      batchSize: 20, // Larger batch size for simpler operations
      continueOnError: true,
      ignoreDuplicates: true, // Handle duplicate exam marks gracefully
      retryAttempts: 2,
      retryDelay: 1000,
    });

    // Update progress
    progress.update(result.processed || 0, result.failed || 0);

    console.log(
      `Bulk exam marks import completed: ${result.processed} successful, ${result.failed} failed`
    );

    // Prepare response based on results
    if (!result.success && result.failed === jsonData.length) {
      return NextResponse.json(
        {
          error: "Failed to import any exam marks",
          details: result.error,
          failures: result.details?.slice(0, 10),
        },
        { status: 500 }
      );
    }

    if (result.failed && result.failed > 0) {
      return NextResponse.json(
        {
          message: `Partially completed. Successfully created ${result.processed} exam marks.`,
          errors: result.details
            ?.map((detail) => ({
              record: detail.id,
              error: detail.error,
            }))
            .slice(0, 20),
          summary: {
            total: jsonData.length,
            successful: result.processed,
            failed: result.failed,
          },
          successCount: result.processed,
        },
        { status: 207 }
      ); // 207 Multi-Status
    }

    return NextResponse.json(
      {
        message: `Successfully imported ${result.processed} exam marks.`,
        summary: {
          total: jsonData.length,
          successful: result.processed,
          failed: 0,
        },
        successCount: result.processed,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing exam marks import:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while importing exam marks.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
