import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

// Initialize Prisma Client to interact with the database
const prisma = new PrismaClient();

// Define the interface for the update request body
interface SemesterUpdateData {
    name?: string;      // Optional fields for partial update
    numerical?: number;
    alias?: string;
}

// PUT request to update an existing Semester
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if the user is authenticated and authorized
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = params; // Extract semester ID from dynamic route
        const data: SemesterUpdateData = await request.json(); // Extract update data from request body
        const { name, numerical, alias } = data;

        // Ensure at least one field is provided for update
        if (!name && numerical == null && !alias) {
            return NextResponse.json({ error: "No fields provided for update" }, { status: 400 });
        }

        // Check if the semester exists
        const semester = await prisma.semester.findUnique({ where: { id } });
        if (!semester) {
            return NextResponse.json({ error: "Semester not found" }, { status: 404 });
        }

        // Check for existing semester conflicts (only if a field to update is provided)
        const whereClause: any = { collegeId: session.user.collegeId, id: { not: id }, OR: [] };
        if (numerical != null) whereClause.OR.push({ numerical });
        if (name) whereClause.OR.push({ name });
        if (alias) whereClause.OR.push({ alias });

        if (whereClause.OR.length > 0) {
            const existingSemester = await prisma.semester.findFirst({
                where: whereClause,
            });

            if (existingSemester) {
                let conflictField = "numerical representation";
                if (existingSemester.numerical === numerical) { conflictField = "numerical representation"; }
                else if (existingSemester.name === name) { conflictField = "name"; }
                else if (existingSemester.alias === alias) { conflictField = "alias"; }

                return NextResponse.json(
                    { error: `A semester with the same ${conflictField} already exists in this college.` },
                    { status: 409 }
                );
            }
        }

        // Build the update data object
        const updateData: Partial<SemesterUpdateData> = {};
        if (name) updateData.name = name;
        if (numerical != null) updateData.numerical = numerical;
        if (alias) updateData.alias = alias;

        // Proceed to update the semester with the provided fields
        const updatedSemester = await prisma.semester.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedSemester, { status: 200 });
    } catch (error) {
        console.error("Error updating semester:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE request to delete an existing Semester
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if the user is authenticated and authorized
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = params; // Extract semester ID from dynamic route

        // Check if the semester exists
        const semester = await prisma.semester.findUnique({ where: { id } });
        if (!semester) {
            return NextResponse.json({ error: "Semester not found" }, { status: 404 });
        }

        // Ensure that the semester belongs to the same college as the user
        if (semester.collegeId !== session.user.collegeId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the semester
        await prisma.semester.delete({ where: { id } });

        return NextResponse.json({ message: "Semester deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting semester:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}