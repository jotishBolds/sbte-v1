// //File : /api/studentBatchExamFee/autoBaseExamFeeInsertion/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
// import { z } from "zod"; // Import Zod

// const prisma = new PrismaClient();

// // Define Zod schema for request body
// const StudentBatchExamFeeSchema = z.object({
//   batchId: z.string().nonempty("Batch ID is required"), // Ensure batchId is a non-empty string
//   dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
//     message: "Invalid dueDate format",
//   }), // Ensure dueDate is a valid date string
// });

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { id: userId } = session.user;

//     const body = await request.json();

//     // Validate request body with Zod
//     const validation = StudentBatchExamFeeSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json(
//         { error: "Validation failed", details: validation.error.format() },
//         { status: 400 }
//       );
//     }

//     const { batchId, dueDate } = validation.data;

//     const parsedDueDate = new Date(dueDate);

//     // Fetch batch and related data
//     const batch = await prisma.batch.findUnique({
//       where: { id: batchId },
//       include: {
//         batchBaseExamFees: true,
//         studentBatches: {
//           include: {
//             student: true,
//             StudentBatchExamFee: true, // Include existing fees
//           },
//         },
//       },
//     });

//     if (!batch) {
//       return NextResponse.json({ error: "Batch not found" }, { status: 404 });
//     }

//     if (batch.batchBaseExamFees.length === 0) {
//       return NextResponse.json(
//         { error: "No base exam fee found for the batch" },
//         { status: 404 }
//       );
//     }

//     const baseFee = batch.batchBaseExamFees[0].baseFee;

//     const studentsUpdated = [];
//     const studentsCreated = [];

//     // Process students
//     for (const studentBatch of batch.studentBatches) {
//       const existingFee = studentBatch.StudentBatchExamFee.find(
//         (fee: { reason: string }) => fee.reason === "Base Exam Fee"
//       );

//       if (existingFee) {
//         // Update existing fee
//         await prisma.studentBatchExamFee.update({
//           where: { id: existingFee.id },
//           data: {
//             examFee: baseFee,
//             dueDate: parsedDueDate,
//             updatedById: userId,
//           },
//         });
//         studentsUpdated.push(studentBatch.student.name);
//       } else {
//         // Create new fee record
//         await prisma.studentBatchExamFee.create({
//           data: {
//             studentBatchId: studentBatch.id,
//             reason: "Base Exam Fee",
//             examFee: baseFee,
//             dueDate: parsedDueDate,
//             createdById: userId,
//           },
//         });
//         studentsCreated.push(studentBatch.student.name);
//       }
//     }

//     return NextResponse.json(
//       {
//         message: "StudentBatchExamFee records processed",
//         updatedStudents: studentsUpdated,
//         createdStudents: studentsCreated,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error processing StudentBatchExamFee records:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";

const prisma = new PrismaClient();
const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 200;
const OPERATION_TIMEOUT = 5000; // 5 seconds timeout for each operation
const MAX_RETRIES = 3;

const StudentBatchExamFeeSchema = z.object({
  batchId: z.string().nonempty("Batch ID is required"),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid dueDate format",
  }),
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const processStudentWithRetry = async (
  studentBatch: any,
  baseFee: number,
  parsedDueDate: Date,
  userId: string,
  retryCount = 0
): Promise<{ success: boolean; studentName: string; error?: string }> => {
  try {
    const existingFee = studentBatch.StudentBatchExamFee.find(
      (fee: { reason: string }) => fee.reason === "Base Exam Fee"
    );

    if (existingFee) {
      await Promise.race([
        prisma.studentBatchExamFee.update({
          where: { id: existingFee.id },
          data: {
            examFee: baseFee,
            dueDate: parsedDueDate,
            updatedById: userId,
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), OPERATION_TIMEOUT)
        )
      ]);
      return { success: true, studentName: studentBatch.student.name };
    } else {
      await Promise.race([
        prisma.studentBatchExamFee.create({
          data: {
            studentBatchId: studentBatch.id,
            reason: "Base Exam Fee",
            examFee: baseFee,
            dueDate: parsedDueDate,
            createdById: userId,
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), OPERATION_TIMEOUT)
        )
      ]);
      return { success: true, studentName: studentBatch.student.name };
    }
  } catch (error) {
    console.error(`Error processing student ${studentBatch.student.name}:`, error);
    
    if (retryCount < MAX_RETRIES) {
      await delay(1000 * (retryCount + 1)); // Exponential backoff
      return processStudentWithRetry(studentBatch, baseFee, parsedDueDate, userId, retryCount + 1);
    }
    
    return { 
      success: false, 
      studentName: studentBatch.student.name,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = session.user;
    const body = await request.json();

    const validation = StudentBatchExamFeeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { batchId, dueDate } = validation.data;
    const parsedDueDate = new Date(dueDate);

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        batchBaseExamFees: true,
        studentBatches: {
          include: {
            student: true,
            StudentBatchExamFee: true,
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batch.batchBaseExamFees.length === 0) {
      return NextResponse.json(
        { error: "No base exam fee found for the batch" },
        { status: 404 }
      );
    }

    const baseFee = batch.batchBaseExamFees[0].baseFee;
    const students = batch.studentBatches;

    let studentsUpdated: string[] = [];
    let studentsCreated: string[] = [];
    let studentsFailed: { name: string; error: string }[] = [];

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batchSlice = students.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batchSlice.map(studentBatch => 
          processStudentWithRetry(studentBatch, baseFee, parsedDueDate, userId)
        )
      );

      results.forEach((result, index) => {
        const studentName = batchSlice[index].student.name;
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            if (batchSlice[index].StudentBatchExamFee.find(fee => fee.reason === "Base Exam Fee")) {
              studentsUpdated.push(studentName);
            } else {
              studentsCreated.push(studentName);
            }
          } else {
            studentsFailed.push({ name: studentName, error: result.value.error || 'Unknown error' });
          }
        } else {
          studentsFailed.push({ name: studentName, error: result.reason?.message || 'Unknown error' });
        }
      });

      if (i + BATCH_SIZE < students.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    return NextResponse.json(
      {
        message: "StudentBatchExamFee records processed with throttling",
        updatedStudents: studentsUpdated,
        createdStudents: studentsCreated,
        failedStudents: studentsFailed,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing StudentBatchExamFee records:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
