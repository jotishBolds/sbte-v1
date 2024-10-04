import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

// Initialize Prisma Client to interact with the database
const prisma = new PrismaClient();

interface ProgramTypeCreationData {
    name: string;
    collegeId: string;
}

// PUT request to update an existing ProgramType
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Get the user session and check authorization
        const session = await getServerSession(authOptions);

        // If the user is not authenticated, return an unauthorized response
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } 
        // If the user is not a COLLEGE_SUPER_ADMIN, return a forbidden response
        else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get the program type id from the request parameters
        const { id } = params;

        // Parse the request body to get the new data
        const data = await request.json();
        const { name } = data;

        // Validate if the program type ID is provided
        if (!id) {
            return NextResponse.json({ error: "Id of Program Type is not getting passed." }, { status: 400 });
        }

        // Check if the program type exists in the database
        const programType = await prisma.programType.findUnique({ where: { id } });
        if (!programType) {
            return NextResponse.json({ error: "Program type not found" }, { status: 404 });
        }

        // Ensure that the program type belongs to the same college as the user
        if (programType.collegeId !== session.user.collegeId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Validate if the new name is provided
        if (!name) {
            return NextResponse.json({ error: "Missing required fields: name" }, { status: 400 });
        }

        // Validate the length of the name (must be smaller than 100 characters)
        if (name.length > 100) {
            return NextResponse.json({ error: "Name must be smaller than 100 characters long." }, { status: 400 });
        }

        // Validate that the name is alphanumeric and not purely numeric
        const alphanumericRegex = /^(?![0-9]+$)[a-zA-Z0-9\s]+$/;
        if (!alphanumericRegex.test(name)) {
            return NextResponse.json({ error: "Name must be alphanumeric and cannot be purely numeric." }, { status: 400 });
        }

        // Check if a program type with the same name already exists in the same college (excluding the current program type)
        const existingProgramType = await prisma.programType.findFirst({
            where: {
                name,
                collegeId: programType.collegeId,
                NOT: {
                    id: programType.id, // Exclude the current program type being updated
                },
            },
        });

        // If a program type with the same name exists, return a conflict error
        if (existingProgramType) {
            return NextResponse.json({ error: `A program type with the name ${name} already exists in this college.` }, { status: 409 });
        }

        // Update the program type with the new name
        const updatedProgramType = await prisma.programType.update({
            where: { id },
            data: { name },
        });

        // Return the updated program type
        return NextResponse.json(updatedProgramType, { status: 200 });
    } catch (error) {
        console.error("Error updating program type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE request to delete an existing ProgramType
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Get the user session and check authorization
        const session = await getServerSession(authOptions);

        // If the user is not authenticated, return an unauthorized response
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } 
        // If the user is not a COLLEGE_SUPER_ADMIN, return a forbidden response
        else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get the program type id from the request parameters
        const { id } = params;

        // Validate if the program type ID is provided
        if (!id) {
            return NextResponse.json({ error: "Id of Program Type is not getting passed." }, { status: 400 });
        }

        // Check if the program type exists in the database
        const programType = await prisma.programType.findUnique({ where: { id } });
        if (!programType) {
            return NextResponse.json({ error: "Program type not found" }, { status: 404 });
        }

        // Ensure that the program type belongs to the same college as the user
        if (programType.collegeId !== session.user.collegeId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the program type from the database
        await prisma.programType.delete({ where: { id } });

        // Return a success message
        return NextResponse.json({ message: "Program type deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting program type:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
