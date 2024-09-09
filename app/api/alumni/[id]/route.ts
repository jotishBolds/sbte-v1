// /api/alumni/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

import { z } from "zod";
import prisma from "@/src/lib/prisma";

const alumniUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phoneNo: z.string().min(10).max(15).optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().min(5).max(255).optional(),
  departmentId: z.string().optional(),
  batchYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  graduationYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 5)
    .optional(),
  gpa: z.number().min(0).max(4).optional(),
  jobStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentPosition: z.string().optional(),
  industry: z.string().optional(),
  linkedInProfile: z.string().url().optional(),
  achievements: z.string().optional(),
  verified: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      session.user.role !== "COLLEGE_SUPER_ADMIN"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const alumnus = await prisma.alumnus.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!alumnus) {
      return NextResponse.json(
        { message: "Alumnus not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(alumnus);
  } catch (error) {
    console.error("Error fetching alumnus:", error);
    return NextResponse.json(
      { message: "Error fetching alumnus" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      session.user.role !== "COLLEGE_SUPER_ADMIN"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = alumniUpdateSchema.parse(body);

    const updatedAlumnus = await prisma.alumnus.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedAlumnus);
  } catch (error) {
    console.error("Error updating alumnus:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error updating alumnus" },
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

    if (
      !session ||
      !session.user ||
      session.user.role !== "COLLEGE_SUPER_ADMIN"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.alumnus.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Alumnus deleted successfully" });
  } catch (error) {
    console.error("Error deleting alumnus:", error);
    return NextResponse.json(
      { message: "Error deleting alumnus" },
      { status: 500 }
    );
  }
}
