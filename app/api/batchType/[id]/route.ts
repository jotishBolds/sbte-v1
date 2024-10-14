// Import necessary modules from Next.js, Prisma, and NextAuth
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating BatchType data
const batchTypeSchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")  // Minimum length validation
        .max(100, "Name must be less than 100 characters"),  // Maximum length validation
});

// PUT method for updating an existing BatchType
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

        // Parse the request body and allow partial validation (e.g., updating only one field)
        const body = await request.json();
        const validationResult = batchTypeSchema.partial().safeParse(body);

        // If validation fails, return a 400 error with validation details
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Check if the BatchType exists and belongs to the user's college
        const existingBatchType = await prisma.batchType.findFirst({
            where: {
                id: params.id,
                collegeId,
            },
        });

        // If the BatchType doesn't exist, return a 404 error
        if (!existingBatchType) {
            return NextResponse.json({ error: "Batch type not found" }, { status: 404 });
        }

        // If updating the name, check if a BatchType with the same name already exists (excluding the current BatchType)
        if (data.name) {
            const duplicateBatchType = await prisma.batchType.findFirst({
                where: {
                    name: data.name,
                    collegeId,
                    NOT: { id: params.id },  // Exclude the current BatchType from the check
                },
            });

            // If a duplicate is found, return a conflict error (409)
            if (duplicateBatchType) {
                return NextResponse.json({ error: "Batch type with this name already exists" }, { status: 409 });
            }
        }

        // Update the BatchType with the new data
        const updatedBatchType = await prisma.batchType.update({
            where: { id: params.id },
            data,
        });

        // Return the updated BatchType with a success status of 200
        return NextResponse.json(updatedBatchType, { status: 200 });
    } catch (error) {
        // Log any errors and return a 500 Internal Server Error
        console.error("Error updating batch type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        // Ensure Prisma disconnects after the request is completed
        await prisma.$disconnect();
    }
}

// DELETE method for removing an existing BatchType
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

        // Check if the BatchType exists and belongs to the user's college
        const existingBatchType = await prisma.batchType.findFirst({
            where: {
                id: params.id,
                collegeId,
            },
        });

        // If the BatchType doesn't exist, return a 404 error
        if (!existingBatchType) {
            return NextResponse.json({ error: "Batch type not found" }, { status: 404 });
        }

        // Delete the BatchType from the database
        await prisma.batchType.delete({
            where: { id: params.id },
        });

        // Return a success message with a status of 200
        return NextResponse.json({ message: "Batch type deleted successfully" }, { status: 200 });
    } catch (error) {
        // Log any errors and return a 500 Internal Server Error
        console.error("Error deleting batch type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        // Ensure Prisma disconnects after the request is completed
        await prisma.$disconnect();
    }
}
