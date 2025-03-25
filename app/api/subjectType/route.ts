//api/subjectType/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating SubjectType data
const subjectTypeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters") // Minimum length validation
    .max(100, "Name must be less than 100 characters"), // Maximum length validation
  alias: z
    .string()
    .min(1, "Alias must be at least 1 characters") // Minimum length validation
    .max(10, "Alias must be less than 10 characters"), // Maximum length validation
});

// POST method to create a new SubjectType
export async function POST(request: NextRequest) {
  try {
    // Retrieve the user's session using NextAuth
    const session = await getServerSession(authOptions);

    // If session is not found, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the role "COLLEGE_SUPER_ADMIN"
    // if (session.user?.role !== "COLLEGE_SUPER_ADMIN" || "TEACHER") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Get the collegeId associated with the user
    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    // Parse the request body and validate it against the schema
    const body = await request.json();
    const validationResult = subjectTypeSchema.safeParse(body);

    // If validation fails, return a 400 error with validation details
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

    // Check if a SubjectType with the same name or alias already exists for the college
    const existingSubjectType = await prisma.subjectType.findFirst({
      where: {
        OR: [
          { name: data.name, collegeId },
          { alias: data.alias, collegeId },
        ],
      },
    });

    // If a duplicate is found, return a conflict error (409)
    if (existingSubjectType) {
      return NextResponse.json(
        {
          error:
            "Subject type with the same name or alias already exists for this college",
        },
        { status: 409 }
      );
    }

    // Create a new SubjectType for the specified college
    const newSubjectType = await prisma.subjectType.create({
      data: {
        ...data, // Include name and alias
        collegeId, // Attach the current user's collegeId
      },
    });

    // Return the newly created SubjectType with a success status of 201
    return NextResponse.json(newSubjectType, { status: 201 });
  } catch (error) {
    // Log any errors and return a 500 Internal Server Error
    console.error("Error creating subject type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects after the request is completed
    await prisma.$disconnect();
  }
}

// GET method to retrieve all SubjectTypes for the user's college
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if (session.user?.role !== "COLLEGE_SUPER_ADMIN" || "TEACHER") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const subjectTypes = await prisma.subjectType.findMany({
      where: {
        collegeId,
      },
      include: {
        college: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(subjectTypes, { status: 200 });
  } catch (error) {
    console.error("Error fetching subject types:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
