// File: app/api/subjects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

const subjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(2).max(20).optional(),
  semester: z.string().min(1).max(20).optional(),
  creditScore: z.number().min(0).max(10).optional(),
  teacherId: z.string().nullable().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subjectId = params.id;
    // Check if the subject exists before updating
    const existingSubject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = subjectSchema.parse(body);

    const subjectData: any = {};
    // Dynamically add only the provided fields to subjectData
    if (validatedData.name) subjectData.name = validatedData.name;
    if (validatedData.code) subjectData.code = validatedData.code;
    if (validatedData.semester) subjectData.semester = validatedData.semester;
    if (validatedData.creditScore) subjectData.creditScore = validatedData.creditScore;

    if (validatedData.teacherId) {
      subjectData.teacher = {
        connect: { id: validatedData.teacherId },
      };
    } else {
      subjectData.teacher = {
        disconnect: true,
      };
    }

    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: subjectData,
      include: {
        department: true,
        teacher: true,
      },
    });

    return NextResponse.json(updatedSubject,{status:200});
  } catch (error) {
    console.error("Error updating subject:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error updating subject", errors: error},
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

    // Check if the user is authenticated and has the HOD role
    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subjectId = params.id;

    // Check if the subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
      );
    }

    // Proceed to delete the subject
    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);

    // Handle specific Prisma errors if necessary
    return NextResponse.json(
      { message: "Error deleting subject" },
      { status: 500 }
    );
  }
}
