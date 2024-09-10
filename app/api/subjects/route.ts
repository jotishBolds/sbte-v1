// File: app/api/subjects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

const subjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  semester: z.string().min(1).max(20),
  creditScore: z.number().min(0).max(10),
  teacherId: z.string().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const departmentId = session.user.departmentId;
    if (!departmentId) {
      return NextResponse.json(
        { message: "Department ID not found" },
        { status: 400 }
      );
    }

    const subjects = await prisma.subject.findMany({
      where: { departmentId },
      include: {
        teacher: {
          select: { 
            name: true 
          },
        },
      },
    });
    
    if(!subjects){
      return NextResponse.json(
        { message: "No subject found for this college" },
        { status: 400 }
      );
    }

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { message: "Error fetching subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const departmentId = session.user.departmentId;
    if (!departmentId) {
      return NextResponse.json(
        { message: "Department ID not found" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = subjectSchema.parse(body);

    const subjectData: any = {
      name: validatedData.name,
      code: validatedData.code,
      semester: validatedData.semester,
      creditScore: validatedData.creditScore,
      department: {
        connect: { id: departmentId },
      },
    };

    if (validatedData.teacherId) {
      subjectData.teacher = {
        connect: { id: validatedData.teacherId },
      };
    }

    const newSubject = await prisma.subject.create({
      data: subjectData,
      include: {
        department: true,
        teacher: true,
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error creating subject" },
      { status: 500 }
    );
  }
}
