//api/employeeCategory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating Category data
const categorySchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  alias: z
    .string()
    .min(1, "Alias must be at least 1 characters")
    .max(50, "Alias must be less than 50 characters"),
  description: z.string().optional(),
});

// POST method to create a new Category
export async function POST(request: NextRequest) {
  try {
    // Retrieve the user's session using NextAuth
    const session = await getServerSession(authOptions);

    // If session is not found, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the role "COLLEGE_SUPER_ADMIN"
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user.role !== "ADM"
    ) {
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
    const validationResult = categorySchema.safeParse(body);

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

    // Check if a Category with the same name or alias already exists for the college
    const existingCategory = await prisma.category.findFirst({
      where: {
        collegeId,
        OR: [
          { name: data.name }, // Check for duplicate name
          { alias: data.alias }, // Check for duplicate alias
        ],
      },
    });

    // If a duplicate is found, return a conflict error (409)
    if (existingCategory) {
      return NextResponse.json(
        {
          error:
            "Category with the same name or alias already exists for this college",
        },
        { status: 409 }
      );
    }

    // Create a new Category for the specified college
    const newCategory = await prisma.category.create({
      data: {
        ...data, // Include name, alias, and description
        collegeId, // Attach the current user's collegeId
      },
    });

    // Return the newly created Category with a success status of 201
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    // Log any errors and return a 500 Internal Server Error
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects after the request is completed
    await prisma.$disconnect();
  }
}

// GET method to retrieve all Categories for the user's college
export async function GET(request: NextRequest) {
  try {
    // Retrieve the user's session using NextAuth
    const session = await getServerSession(authOptions);

    // If session is not found, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has appropriate role
    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "TEACHER" &&
      session.user?.role !== "ADM" &&
      session.user?.role !== "HOD" &&
      session.user?.role !== "FINANCE_MANAGER" &&
      session.user?.role !== "STUDENT" &&
      session.user?.role !== "EDUCATION_DEPARTMENT" &&
      session.user?.role !== "SBTE_ADMIN"
    ) {
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

    // Find all Categories for the specified college
    const categories = await prisma.category.findMany({
      where: {
        collegeId,
      },
    });

    // Return the Categories with a success status of 200
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    // Log any errors and return a 500 Internal Server Error
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Ensure Prisma disconnects after the request is completed
    await prisma.$disconnect();
  }
}
