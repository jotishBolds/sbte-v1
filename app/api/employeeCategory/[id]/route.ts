import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating Category data
const categorySchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name must be less than 100 characters")
        .optional(),
    alias: z.string()
        .min(1, "Alias must be at least 1 characters")
        .max(50, "Alias must be less than 50 characters")
        .optional(),
    description: z.string().optional(),
});


// GET method for retrieving a Category by its ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }  // Destructure 'id' from request params
) {
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

        // Find the Category by its ID and ensure it belongs to the user's college
        const category = await prisma.category.findFirst({
            where: {
                id: params.id,
                collegeId,
            },
        });

        // If the Category is not found, return a 404 error
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Return the Category data with a success status of 200
        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        // Log any errors and return a 500 Internal Server Error
        console.error("Error fetching category by ID:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        // Ensure Prisma disconnects after the request is completed
        await prisma.$disconnect();
    }
}

// PUT method for updating an existing Category
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }  // Destructure 'id' from request params
) {
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

        // Parse the request body and allow partial validation
        const body = await request.json();
        const validationResult = categorySchema.partial().safeParse(body);

        // If validation fails, return a 400 error with validation details
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Check if the Category exists and belongs to the user's college
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: params.id,
                collegeId,
            },
        });

        // If the Category doesn't exist, return a 404 error
        if (!existingCategory) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // If updating the name or alias, check if another Category with the same name or alias exists (excluding the current Category)
        if (data.name || data.alias) {
            const duplicateCategory = await prisma.category.findFirst({
                where: {
                    collegeId,
                    OR: [
                        { name: data.name },
                        { alias: data.alias },
                    ],
                    NOT: { id: params.id },
                },
            });

            // If a duplicate is found, return a conflict error (409)
            if (duplicateCategory) {
                return NextResponse.json(
                    { error: "Category with this name or alias already exists" },
                    { status: 409 }
                );
            }
        }

        // Update the Category with the new data
        const updatedCategory = await prisma.category.update({
            where: { id: params.id },
            data,
        });

        // Return the updated Category with a success status of 200
        return NextResponse.json(updatedCategory, { status: 200 });
    } catch (error) {
        // Log any errors and return a 500 Internal Server Error
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        // Ensure Prisma disconnects after the request is completed
        await prisma.$disconnect();
    }
}

// DELETE method for removing an existing Category
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }  // Destructure 'id' from request params
) {
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

        // Check if the Category exists and belongs to the user's college
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: params.id,
                collegeId,
            },
        });

        // If the Category doesn't exist, return a 404 error
        if (!existingCategory) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Delete the Category from the database
        await prisma.category.delete({
            where: { id: params.id },
        });

        // Return a success message with a status of 200
        return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
    } catch (error) {
        // Log any errors and return a 500 Internal Server Error
        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        // Ensure Prisma disconnects after the request is completed
        await prisma.$disconnect();
    }
}
