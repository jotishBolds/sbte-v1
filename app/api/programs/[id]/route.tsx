import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const programUpdateSchema = z.object({
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
  departmentId: z.string(),
  programTypeId: z.string(),
  isActive: z.boolean(),
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
    const validationResult = programUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { departmentId, programTypeId, ...data } = validationResult.data;

    // Verify program exists and belongs to user's college
    const existingProgram = await prisma.program.findFirst({
      where: {
        id: params.id,
        department: {
          collegeId,
        },
      },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Verify department belongs to user's college
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
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
        id: programTypeId,
        collegeId,
      },
    });

    if (!programType) {
      return NextResponse.json(
        { error: "Invalid program type for this college" },
        { status: 400 }
      );
    }

    const updatedProgram = await prisma.program.update({
      where: { id: params.id },
      data: {
        ...data,
        departmentId,
        programTypeId,
      },
      include: {
        department: { select: { name: true } },
        programType: { select: { name: true } },
      },
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify program exists and belongs to user's college
    const existingProgram = await prisma.program.findFirst({
      where: {
        id: params.id,
        department: {
          collegeId,
        },
      },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    await prisma.program.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
