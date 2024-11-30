//File : /api/batch/[id]/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, BatchStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Validation schema for assigning students
const assignStudentsSchema = z.object({
  studentIds: z.array(z.string()), // Ensure studentIds is an array of strings
});

const batchUpdateSchema = z.object({
  studentIds: z
    .array(z.string().cuid())
    .nonempty("studentIds array cannot be empty"),
  batchStatus: z.nativeEnum(BatchStatus),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: batchId } = params;
    const requestBody = await request.json();

    // Validate request body using Zod
    const validationResult = batchUpdateSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { studentIds, batchStatus } = validationResult.data;

    // Check if the Batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Check if all provided student IDs exist in the batch
    const validStudentIds = await prisma.studentBatch.findMany({
      where: {
        batchId,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    const validIds = validStudentIds.map((record) => record.studentId);
    const invalidIds = studentIds.filter((id) => !validIds.includes(id));

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Some students not found in batch: ${invalidIds.join(", ")}` },
        { status: 404 }
      );
    }

    // Update batchStatus for all valid student IDs in this batch
    await prisma.studentBatch.updateMany({
      where: {
        batchId,
        studentId: { in: validIds },
      },
      data: { batchStatus },
    });

    return NextResponse.json(
      { message: "Batch status updated for all specified students" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating batch status for students:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
// POST request to assign students to a specific batch
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } } // 'id' refers to batchId
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "SBTE_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const batchId = params.id;
    const body = await request.json();

    // Validate request body with Zod schema
    const validationResult = assignStudentsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { studentIds } = validationResult.data;

    // Check if the batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!existingBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Check if students are already assigned to the batch
    const alreadyAssignedStudents = await prisma.studentBatch.findMany({
      where: {
        batchId,
        studentId: { in: studentIds },
      },
    });

    const alreadyAssignedStudentIds = alreadyAssignedStudents.map(
      (assignment) => assignment.studentId
    );

    // Filter students not yet assigned to the batch
    const studentsToAssign = studentIds.filter(
      (studentId) => !alreadyAssignedStudentIds.includes(studentId)
    );

    if (studentsToAssign.length === 0) {
      return NextResponse.json(
        { message: "All selected students are already assigned to the batch" },
        { status: 400 }
      );
    }

    const invalidStudentIds: string[] = [];
    // Assign students to the batch
    const assignedStudents = await Promise.all(
      studentsToAssign.map(async (studentId) => {
        const existingStudent = await prisma.student.findUnique({
          where: { id: studentId },
        });

        if (!existingStudent) {
          invalidStudentIds.push(studentId);
          return null; // Skip creation for invalid students
        }

        return prisma.studentBatch.create({
          data: {
            batchId,
            studentId,
            batchStatus: BatchStatus.IN_PROGRESS,
          },
        });
      })
    );

    return NextResponse.json(
      {
        message: "Students assigned successfully",
        data: assignedStudents,
        skippedStudents: alreadyAssignedStudentIds,
        invalidStudents: invalidStudentIds, // Include invalid student IDs in the response
      },

      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning students:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET request to fetch all students assigned to a specific batch
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "SBTE_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const batchId = params.id;

    // Check if the batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Fetch all students assigned to the batch
    const assignedStudents = await prisma.studentBatch.findMany({
      where: { batchId },
      include: {
        student: true, // Include student details
      },
    });

    if (assignedStudents.length === 0) {
      return NextResponse.json(
        { error: "No students assigned to this batch" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignedStudents, { status: 200 });
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
