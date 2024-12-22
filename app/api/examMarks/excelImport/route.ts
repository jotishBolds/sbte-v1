//File: /api/examMarks/excelImport/route.ts

import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import { z } from "zod";

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

    for (const row of worksheet.getRows(2, worksheet.rowCount - 1) || []) {
      if (!row.hasValues) continue; // Skip rows with no values

      const rowData = {
        studentName: row.getCell("B").value?.toString(),
        enrollNo: row.getCell("C").value?.toString(),
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
        // continue;
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

    // Process in smaller chunks
    const CHUNK_SIZE = 10;
    const dataChunks = chunkArray(jsonData, CHUNK_SIZE);

    let successCount = 0;
    let errors: any[] = [];

    for (const chunk of dataChunks) {
      try {
        await prisma.$transaction(
          async (tx) => {
            for (const data of chunk) {
              await tx.examMark.create({
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
              successCount++;
            }
          },
          {
            timeout: 20000, // 20 second timeout
            maxWait: 5000, // 5 second maximum wait time
          }
        );
      } catch (chunkError) {
        console.error("Error processing chunk:", chunkError);
        errors.push({
          error:
            chunkError instanceof Error ? chunkError.message : "Unknown error",
          affectedRecords: chunk.length,
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          message: `Partially completed. Successfully created ${successCount} exam marks.`,
          errors: errors,
          successCount,
        },
        { status: 207 }
      ); // 207 Multi-Status
    }

    return NextResponse.json(
      {
        message: `Successfully imported ${successCount} exam marks.`,
        successCount,
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
