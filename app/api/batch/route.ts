//api/batch/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const batchSchema = z.object({
  termId: z.string(),
  academicYearId: z.string(),
  programId: z.string(),
  batchTypeId: z.string(),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  status: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the role "COLLEGE_SUPER_ADMIN"
    // if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const createdById = session.user.id;
    const collegeId = session.user.collegeId;

    const body = await request.json();
    const validationResult = batchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      termId,
      academicYearId,
      programId,
      batchTypeId,
      startDate,
      endDate,
      status,
    } = validationResult.data;

    // Fetch the program, department, and verify college
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { department: true },
    });

    if (!program || program.department.collegeId !== collegeId) {
      return NextResponse.json(
        { error: "Program does not belong to the user's college" },
        { status: 400 }
      );
    }

    const semester = await prisma.semester.findFirst({
      where: { id: termId, collegeId },
    });
    const academicYear = await prisma.academicYear.findFirst({
      where: { id: academicYearId, collegeId },
    });
    const batchType = await prisma.batchType.findFirst({
      where: { id: batchTypeId, collegeId },
    });

    // Check if all entities belong to the user's college
    if (!semester || !academicYear || !batchType) {
      return NextResponse.json(
        {
          error:
            "Invalid semester, academic year, or batch type for the current college",
        },
        { status: 400 }
      );
    }

    // Check if a batch with the same program, term, and academic year already exists
    const existingBatch = await prisma.batch.findFirst({
      where: {
        programId,
        termId,
        academicYearId,
        batchTypeId,
      },
    });

    if (existingBatch) {
      return NextResponse.json(
        {
          error:
            "A batch with the same program, semester, and academic year already exists",
        },
        { status: 409 }
      );
    }

    // Generate the batch name by concatenating program code, semester alias, and academic year name
    const batchName = `${program.code}-${semester.alias}-${academicYear.name}`;

    // Create the new batch
    const newBatch = await prisma.batch.create({
      data: {
        name: batchName,
        termId,
        academicYearId,
        programId,
        batchTypeId,
        startDate,
        endDate,
        status,
        createdById,
        updatedById: createdById,
      },
      include: {
        term: true,
        academicYear: true,
        batchType: true,
        program: true,
      },
    });

    // Return the newly created batch with related names
    return NextResponse.json(
      {
        id: newBatch.id,
        name: newBatch.name,
        term: newBatch.term.alias,
        academicYear: newBatch.academicYear.name,
        batchType: newBatch.batchType.name,
        program: newBatch.program.code,
        startDate: newBatch.startDate,
        endDate: newBatch.endDate,
        status: newBatch.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "HOD" &&
      session.user?.role !== "STUDENT" &&
      session.user?.role !== "FINANCE_MANAGER" &&
      session.user?.role !== "TEACHER" &&
      session.user?.role !== "ADM" &&
      session.user?.role !== "SBTE_ADMIN" &&
      session.user?.role !== "EDUCATION_DEPARTMENT"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");
    const academicYearId = searchParams.get("academicYearId");

    // Check if the program exists for the given programId
    if (programId) {
      const existingProgram = await prisma.program.findFirst({
        where: {
          id: programId,
          department: {
            collegeId,
          },
        },
      });

      if (!existingProgram) {
        return NextResponse.json(
          { error: "Program not found" },
          { status: 404 }
        );
      }
    }

    // Base query to fetch batches associated with the user's college
    const whereClause: any = {
      program: {
        department: {
          collegeId,
        },
      },
    };

    // Add programId and/or academicYearId to the query if they are provided
    if (programId) {
      whereClause["programId"] = programId;
    }

    if (academicYearId) {
      whereClause["academicYearId"] = academicYearId;
    }

    // Fetch batches based on the constructed where clause
    const batches = await prisma.batch.findMany({
      where: whereClause,
      include: {
        term: true,
        academicYear: true,
        batchType: true,
        program: true,
        createdBy: true,
        updatedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (batches.length === 0) {
      return NextResponse.json({ message: "No batch found" }, { status: 200 });
    }

    const responseData = batches.map((batch) => ({
      id: batch.id,
      name: batch.name,
      term: {
        name: batch.term.alias,
      },
      academicYear: {
        name: batch.academicYear.name,
      },
      batchType: batch.batchType.name,
      program: {
        name: batch.program.name,
        code: batch.program.code,
      },
      startDate: batch.startDate,
      endDate: batch.endDate,
      status: batch.status,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
      createdBy: batch.createdBy
        ? {
            id: batch.createdBy.id,
            name: batch.createdBy.username,
            email: batch.createdBy.email,
          }
        : null,
      updatedBy: batch.updatedBy
        ? {
            id: batch.updatedBy.id,
            name: batch.updatedBy.username,
            email: batch.updatedBy.email,
          }
        : null,
    }));

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
