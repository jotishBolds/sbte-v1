// Import necessary modules from Next.js and Prisma
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating BatchType data
const batchTypeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters") // Minimum length validation
    .max(100, "Name must be less than 100 characters"), // Maximum length validation
});

// POST method to create a new BatchType
export async function POST(request: NextRequest) {
  try {
    // Retrieve the user's session using NextAuth
    const session = await getServerSession(authOptions);

    // If session is not found, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the role "COLLEGE_SUPER_ADMIN"
    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    const validationResult = batchTypeSchema.safeParse(body);

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

    // Check if a BatchType with the same name already exists for the college
    const existingBatchType = await prisma.batchType.findFirst({
      where: {
        name: data.name,
        collegeId,
      },
    });

    // If a duplicate is found, return a conflict error (409)
    if (existingBatchType) {
      return NextResponse.json(
        { error: "Batch type already exists for this college" },
        { status: 409 }
      );
    }

    // Create a new BatchType for the specified college
    const newBatchType = await prisma.batchType.create({
      data: {
        ...data, // Include name and other fields
        collegeId, // Attach the current user's collegeId
      },
    });

    // Return the newly created BatchType with a success status of 201
    return NextResponse.json(newBatchType, { status: 201 });
  } catch (error) {
    // Log any errors and return a 500 Internal Server Error
    console.error("Error creating batch type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects after the request is completed
    await prisma.$disconnect();
  }
}

// GET method to retrieve all BatchTypes for the user's college
export async function GET(request: NextRequest) {
  try {
    // Retrieve the user's session using NextAuth
    const session = await getServerSession(authOptions);

    // If session is not found, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the role "COLLEGE_SUPER_ADMIN"
    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the collegeId associated with the user
    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    // Find all BatchTypes for the specified college
    const batchTypes = await prisma.batchType.findMany({
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

    // Return the BatchTypes with a success status of 200
    return NextResponse.json(batchTypes, { status: 200 });
  } catch (error) {
    // Log any errors and return a 500 Internal Server Error
    console.error("Error fetching batch types:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects after the request is completed
    await prisma.$disconnect();
  }
}
