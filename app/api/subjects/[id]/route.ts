// Import necessary modules from Next.js and Prisma
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating Subject data
const subjectSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters"),
  alias: z.string().optional(),
  creditScore: z.number().min(0, "Credit score must be a positive number"),
  status: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Destructure 'id' from request params
) {
  try {
    const session = await getServerSession(authOptions);

    // If session is not found, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the role "COLLEGE_SUPER_ADMIN"
    if (session.user?.role !== "COLLEGE_SUPER_ADMIN" || "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;

    // If the user is not associated with a college, return an error
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    // Find the subject by its ID and ensure it belongs to the user's college
    const subject = await prisma.subject.findFirst({
      where: {
        id: params.id,
        collegeId,
      },
    });

    // If the subject is not found, return a 404 error
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Return the subject data with a success status of 200
    return NextResponse.json(subject, { status: 200 });
  } catch (error) {
    console.error("Error fetching subject by ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // Destructure 'id' from request params
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN" || "TEACHER") {
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
    const validationResult = subjectSchema.partial().safeParse(body);

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

    const existingSubject = await prisma.subject.findFirst({
      where: {
        id: params.id,
        collegeId,
      },
    });

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (data.code) {
      const duplicateSubject = await prisma.subject.findFirst({
        where: {
          code: data.code,
          collegeId,
          NOT: { id: params.id },
        },
      });

      if (duplicateSubject) {
        return NextResponse.json(
          { error: "Subject with this code already exists" },
          { status: 409 }
        );
      }
    }

    const updatedSubject = await prisma.subject.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // Destructure 'id' from request params
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user?.role !== "COLLEGE_SUPER_ADMIN", "TEACHER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const existingSubject = await prisma.subject.findFirst({
      where: {
        id: params.id,
        collegeId,
      },
    });

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await prisma.subject.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Subject deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
