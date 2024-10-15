// Import necessary modules from Next.js, Prisma, and NextAuth
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating SubjectType data
const subjectTypeSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters").optional(),
    alias: z.string().min(1, "Alias must be at least 1 characters").max(10, "Alias must be less than 10 characters").optional(),
});

// PUT method for updating an existing SubjectType
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
        const validationResult = subjectTypeSchema.partial().safeParse(body);

        // If validation fails, return a 400 error with validation details
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Check if the SubjectType exists and belongs to the user's college
        const existingSubjectType = await prisma.subjectType.findFirst({
            where: {
                id: params.id,
                collegeId,
            },
        });

        // If the SubjectType doesn't exist, return a 404 error
        if (!existingSubjectType) {
            return NextResponse.json({ error: "Subject type not found" }, { status: 404 });
        }

        // If updating the name or alias, check if a SubjectType with the same name or alias already exists (excluding the current SubjectType)
        if (data.name || data.alias) {
            const duplicateSubjectType = await prisma.subjectType.findFirst({
                where: {
                    collegeId,
                    OR: [
                        { name: data.name },
                        { alias: data.alias },
                    ],
                    NOT: { id: params.id },  // Exclude the current SubjectType from the check
                },
            });

            // If a duplicate is found, return a conflict error (409)
            if (duplicateSubjectType) {
                return NextResponse.json({ error: "Subject type with this name or alias already exists" }, { status: 409 });
            }
        }

        // Update the SubjectType with the new data
        const updatedSubjectType = await prisma.subjectType.update({
            where: { id: params.id },
            data,
        });

        // Return the updated SubjectType with a success status of 200
        return NextResponse.json(updatedSubjectType, { status: 200 });
    } catch (error) {
        // Log any errors and return a 500 Internal Server Error
        console.error("Error updating subject type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        // Ensure Prisma disconnects after the request is completed
        await prisma.$disconnect();
    }
}

// DELETE method for removing an existing SubjectType
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

        // Check if the SubjectType exists and belongs to the user's college
        const existingSubjectType = await prisma.subjectType.findFirst({
            where: {
                id: params.id,
                collegeId,
            },
        });

        // If the SubjectType doesn't exist, return a 404 error
        if (!existingSubjectType) {
            return NextResponse.json({ error: "Subject type not found" }, { status: 404 });
        }

        // Delete the SubjectType from the database
        await prisma.subjectType.delete({
            where: { id: params.id },
        });

        // Return a success message with a status of 200
        return NextResponse.json({ message: "Subject type deleted successfully" }, { status: 200 });
    } catch (error) {
        // Log any errors and return a 500 Internal Server Error
        console.error("Error deleting subject type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        // Ensure Prisma disconnects after the request is completed
        await prisma.$disconnect();
    }
}

