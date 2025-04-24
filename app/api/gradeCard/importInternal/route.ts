//File : app/api/gradeCard/importInternal/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import * as ExcelJS from "exceljs";
import { z } from "zod";

const rowSchema = z.object({
  enrollmentNo: z.string().min(1, "Enrollment number is required"),
  internalMarks: z
    .number()
    .min(0, "Internal marks must be a positive number")
    .max(30, "Internal marks cannot exceed 30"),
});

const generateGradeCardNumber = async (
  batchId: string,
  semesterId: string,
  student: { enrollmentNo: string | null; id: string }, // Handle null explicitly
  tx: any,
  createdGradeCards: Set<string> // Track grade card numbers in the current transaction
): Promise<string> => {
  if (!student.enrollmentNo) {
    throw new Error("Enrollment number is required.");
  }

  const year = student.enrollmentNo.substring(1, 3);
  const branchCode = student.enrollmentNo.substring(5, 7);

  const semester = await tx.semester.findUnique({
    where: { id: semesterId },
    select: { numerical: true },
  });

  if (!semester) {
    throw new Error(`Semester with ID ${semesterId} not found.`);
  }

  // Fetch existing grade card numbers from the database
  const existingGradeCards: { cardNo: string }[] =
    await tx.studentGradeCard.findMany({
      where: { batchId, semesterId },
      select: { cardNo: true },
    });

  // Collect all existing numbers (database + in-memory)
  const allExistingNumbers = new Set([
    ...existingGradeCards.map((gc: { cardNo: string }) => gc.cardNo),
    ...createdGradeCards,
  ]);

  let counter = 1;
  while (true) {
    const counterStr = counter.toString().padStart(3, "0");
    const newCardNo = `GC${year}${branchCode}${semester.numerical}${counterStr}`;

    if (!allExistingNumbers.has(newCardNo)) {
      createdGradeCards.add(newCardNo);
      return newCardNo;
    }
    counter++;
  }
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session?.user?.collegeId;

    if (!collegeId) {
      return NextResponse.json(
        { error: "No college ID found in session" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const batchSubjectId = formData.get("batchSubjectId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!batchSubjectId) {
      return NextResponse.json(
        { error: "Batch Subject ID is required" },
        { status: 400 }
      );
    }

    const batchSubject = await prisma.batchSubject.findUnique({
      where: { id: batchSubjectId.toString() },
      include: { batch: true },
    });

    if (!batchSubject) {
      return NextResponse.json(
        { error: "Invalid batch subject ID." },
        { status: 400 }
      );
    }

    const semesterId = batchSubject.batch.termId;
    const batchId: string | null = batchSubject.batch?.id ?? null;
    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is missing" },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const worksheet = workbook.worksheets[0];

    const errors: { row: number; enrollmentNo?: string; error: any }[] = [];
    const rows: { enrollmentNo: string; internalMarks: number }[] = [];
    const missingStudents: {
      enrollmentNo?: string;
      row?: number;
      error: string;
    }[] = [];
    const existingRecords: { enrollmentNo: string; message: string }[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      const enrollmentNo = (row.getCell("C").value ?? "").toString().trim();
      const internalMarks = parseFloat(row.getCell("D").value as string) || 0;

      if (!enrollmentNo) {
        missingStudents.push({
          row: rowNumber,
          error: "Missing enrollment number",
        });
        return;
      }

      const rowData = { enrollmentNo, internalMarks };
      const validationResult = rowSchema.safeParse(rowData);

      if (!validationResult.success) {
        errors.push({
          row: rowNumber,
          enrollmentNo,
          error: validationResult.error.format(),
        });
        return;
      }
      rows.push(validationResult.data);
    });

    const studentEnrollments = rows.map((row) => row.enrollmentNo);
    const students = await prisma.student.findMany({
      where: { enrollmentNo: { in: studentEnrollments } },
      select: { id: true, enrollmentNo: true },
    });

    const studentMap = new Map(students.map((s) => [s.enrollmentNo, s.id]));

    if (!batchSubject) {
      throw new Error("Batch subject not found.");
    }

    // Step 5: Fetch students assigned to the batch
    const assignedStudents = await prisma.studentBatch.findMany({
      where: { batchId: batchSubject.batchId },
      select: { studentId: true },
    });

    // Step 6: Create a Set for quick lookup of assigned students
    const assignedStudentSet = new Set(
      assignedStudents.map((s) => s.studentId)
    );

    for (const row of rows) {
      const enrollmentNo = row.enrollmentNo.trim();
      const studentId = studentMap.get(enrollmentNo);

      if (!studentId) {
        missingStudents.push({
          enrollmentNo,
          error: "Student not found in the system",
        });
        continue; // Skip further checks for this row
      }
      if (!assignedStudentSet.has(studentId)) {
        missingStudents.push({
          enrollmentNo,
          error: "Student is not assigned to this batch.",
        });
        continue; // Skip further checks for this row
      } else {
        const existingRecord = await prisma.subjectGradeDetail.findFirst({
          where: {
            studentGradeCard: { studentId: studentMap.get(row.enrollmentNo) },
            batchSubjectId: batchSubjectId,
          },
        });
        if (existingRecord) {
          existingRecords.push({
            enrollmentNo: row.enrollmentNo,
            message: "Internal marks already exist for this student.",
          });
        }
      }
    }

    if (errors.length || missingStudents.length || existingRecords.length) {
      return NextResponse.json(
        {
          errors,
          missingStudents,
          existingRecords,
        },
        { status: 400 }
      );
    }


    // ✅ NOW proceed to chunked transaction only if everything is clean
    const CHUNK_SIZE = 50;

    // Only include rows that passed all checks and have valid student mappings
    const validRows = rows.filter((row) => {
      const studentId = studentMap.get(row.enrollmentNo.trim());
      return (
        studentId &&
        assignedStudentSet.has(studentId) &&
        !existingRecords.some((rec) => rec.enrollmentNo === row.enrollmentNo)
      );
    });

    // Break validRows into chunks to prevent timeout
    const chunks = [];
    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      chunks.push(validRows.slice(i, i + CHUNK_SIZE));
    }

    const createdGradeCards = new Set<string>();

    for (const chunk of chunks) {
      await prisma.$transaction(async (tx) => {
        for (const row of chunk) {
          const enrollmentNo = row.enrollmentNo.trim();
          const studentId = studentMap.get(enrollmentNo);

          if (!studentId) continue;

          // Check if grade card already exists
          let studentGradeCard = await tx.studentGradeCard.findFirst({
            where: {
              studentId,
              batchId,
              semesterId,
            },
          });

          if (!studentGradeCard) {
            const newCardNo = await generateGradeCardNumber(
              batchId,
              semesterId,
              { enrollmentNo, id: studentId },
              tx,
              createdGradeCards
            );

            studentGradeCard = await tx.studentGradeCard.create({
              data: {
                studentId,
                batchId,
                semesterId,
                cardNo: newCardNo,
              },
            });
          }

          await tx.subjectGradeDetail.create({
            data: {
              studentGradeCardId: studentGradeCard.id,
              batchSubjectId,
              internalMarks: row.internalMarks,
              credit: batchSubject.creditScore,
            },
          });
        }
      });
    }

    return NextResponse.json(
      {
        message: `Successfully imported ${validRows.length} records.`,
        successCount: validRows.length,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error processing internal marks import:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while importing internal marks.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}





    // await prisma.$transaction(async (tx) => {
    //   const createdGradeCards = new Set<string>(); // Store generated grade cards
    //   for (const row of rows) {
    //     let student = await tx.student.findUnique({
    //       where: { enrollmentNo: row.enrollmentNo },
    //       select: { id: true, enrollmentNo: true },
    //     });

    //     if (!student) {
    //       missingStudents.push({
    //         enrollmentNo: row.enrollmentNo,
    //         error: "Student not found in the system",
    //       });
    //       continue;
    //     }

    //     let gradeCard = await tx.studentGradeCard.findFirst({
    //       where: { studentId: student.id, semesterId, batchId },
    //     });

    //     if (!gradeCard) {
    //       const cardNo = await generateGradeCardNumber(
    //         batchId,
    //         semesterId,
    //         student,
    //         tx,
    //         createdGradeCards
    //       );

    //       gradeCard = await tx.studentGradeCard.create({
    //         data: { studentId: student.id, semesterId, batchId, cardNo },
    //       });
    //     }

    //     await tx.subjectGradeDetail.create({
    //       data: {
    //         studentGradeCardId: gradeCard.id,
    //         batchSubjectId,
    //         internalMarks: row.internalMarks,
    //         credit: batchSubject.creditScore,
    //       },
    //     });
    //   }
    // });

    
    // return NextResponse.json(
    //   {
    //     message: `Successfully imported ${rows.length} records.`,
    //     successCount: rows.length,
    //   },
    //   { status: 201 }
    // );