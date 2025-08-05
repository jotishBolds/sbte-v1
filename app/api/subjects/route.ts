// Import necessary modules from Next.js and Prisma
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { createApiResponse, createApiErrorResponse } from "@/lib/api-response";
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return createApiErrorResponse("Unauthorized", 401);
    }

    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "TEACHER"
    ) {
      return createApiErrorResponse("Forbidden", 403);
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return createApiErrorResponse(
        "User is not associated with a college",
        400
      );
    }

    const body = await request.json();
    const validationResult = subjectSchema.safeParse(body);

    if (!validationResult.success) {
      return createApiErrorResponse(
        "Validation failed",
        400,
        validationResult.error.format()
      );
    }

    const data = validationResult.data;

    const existingSubject = await prisma.subject.findFirst({
      where: {
        code: data.code,
        collegeId,
      },
    });

    if (existingSubject) {
      return createApiErrorResponse(
        "Subject with this code already exists",
        409
      );
    }

    const newSubject = await prisma.subject.create({
      data: {
        ...data,
        createdById: session.user.id,
        collegeId,
      },
    });

    return createApiResponse(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return createApiErrorResponse("Internal Server Error", 500);
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return createApiErrorResponse("Unauthorized", 401);
    }

    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "TEACHER"
    ) {
      return createApiErrorResponse("Forbidden", 403);
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return createApiErrorResponse(
        "User is not associated with a college",
        400
      );
    }

    const subjects = await prisma.subject.findMany({
      where: { collegeId },
      include: {
        createdBy: {
          select: {
            username: true,
          },
        },
      },
    });

    const formattedSubjects = subjects.map((subject) => ({
      ...subject,
      createdByName: subject.createdBy.username,
    }));

    return createApiResponse(formattedSubjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return createApiErrorResponse("Internal Server Error", 500);
  } finally {
    await prisma.$disconnect();
  }
}
