//api/programs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Validation schema for program creation
const programSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters"),
  alias: z
    .string()
    .min(2, "Alias must be at least 2 characters")
    .max(50, "Alias must be less than 50 characters"),
  departmentId: z.string({
    required_error: "Department ID is required",
  }),
  programTypeId: z.string({
    required_error: "Program Type ID is required",
  }),
  isActive: z.boolean().optional().default(true),
  numberOfSemesters: z
    .number({
      required_error: "Number of semesters is required",
    })
    .min(1, "Program must have at least 1 semester"),
});

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Log the received data for debugging
    console.log("Received data:", body);

    const validationResult = programSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify department belongs to user's college
    const department = await prisma.department.findUnique({
      where: {
        id: data.departmentId,
        collegeId,
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Invalid department for this college" },
        { status: 400 }
      );
    }

    // Verify program type belongs to user's college
    const programType = await prisma.programType.findUnique({
      where: {
        id: data.programTypeId,
        collegeId,
      },
    });

    if (!programType) {
      return NextResponse.json(
        { error: "Invalid program type for this college" },
        { status: 400 }
      );
    }

    // Check if program code already exists
    const existingProgram = await prisma.program.findFirst({
      where: {
        code: data.code,
        department: {
          collegeId,
        },
      },
    });

    if (existingProgram) {
      return NextResponse.json(
        { error: "Program code already exists in this college" },
        { status: 409 }
      );
    }

    // Transaction block
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Create the new program
      const newProgram = await prisma.program.create({
        data: {
          name: data.name,
          code: data.code,
          alias: data.alias,
          department: { connect: { id: data.departmentId } },
          programType: { connect: { id: data.programTypeId } },
          isActive: data.isActive,
        },
        include: {
          department: { select: { name: true } },
          programType: { select: { name: true } },
        },
      });

      // Step 2: Fetch relevant semesters based on the number of semesters
      const semesters = await prisma.semester.findMany({
        where: {
          numerical: {
            lte: data.numberOfSemesters, // Fetch semesters <= numberOfSemesters
          },
          collegeId: collegeId, // Ensure semesters belong to the same college
        },
      });

      // Step 3: Check if enough semesters are available
      if (semesters.length < data.numberOfSemesters) {
        throw new Error(
          `Not enough semesters created for the college. Expected: ${data.numberOfSemesters}, Found: ${semesters.length}`
        );
      }

      // Step 4: Create SemesterProgram entries for each fetched semester
      const semesterProgramEntries = semesters.map((semester) => ({
        semesterId: semester.id,
        programId: newProgram.id,
      }));

      await prisma.semesterProgram.createMany({
        data: semesterProgramEntries,
      });

      return { newProgram, semesterProgramEntries };
    });

    // If transaction succeeds
    return NextResponse.json(
      {
        program: result.newProgram,
        semesterProgramEntries: result.semesterProgramEntries,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating program with semesters:", error);

    // Check if the error is an instance of Error
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Handle unknown error types
    return NextResponse.json(
      { error: "An unknown error occurred" },
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

    // Allow access for roles that need to view programs
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "HOD" &&
      session.user?.role !== "TEACHER" &&
      session.user?.role !== "FINANCE_MANAGER" &&
      session.user?.role !== "STUDENT" &&
      session.user?.role !== "ADM" &&
      session.user?.role !== "SBTE_ADMIN" &&
      session.user?.role !== "EDUCATION_DEPARTMENT"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const programs = await prisma.program.findMany({
      where: {
        department: {
          collegeId,
        },
      },
      include: {
        department: { select: { name: true } },
        programType: { select: { name: true } },
        semesterPrograms: {
          include: {
            semester: {
              select: {
                name: true,
                alias: true,
                numerical: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(programs, { status: 200 });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
