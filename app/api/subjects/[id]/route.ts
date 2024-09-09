// File: app/api/subjects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

const subjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  semester: z.string().min(1).max(20),
  creditScore: z.number().min(0).max(10),
  teacherId: z.string().nullable(),
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
    const body = await request.json();
    const validatedData = subjectSchema.parse(body);

    const subjectData: any = {
      name: validatedData.name,
      code: validatedData.code,
      semester: validatedData.semester,
      creditScore: validatedData.creditScore,
    };

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

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error updating subject" },
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

    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subjectId = params.id;

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { message: "Error deleting subject" },
      { status: 500 }
    );
  }
}
