import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

// PUT request to update an existing Semester
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        // If the user is not authenticated or not authorized
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = params;
        const data = await request.json();
        const { name, numerical, alias } = data;

        // Check if semester ID is passed and input fields are valid
        if (!id) {
            return NextResponse.json({ error: "Semester ID is missing." }, { status: 400 });
        }
        if (!name || numerical == null || !alias) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        // Check if the semester exists
        const existingSemester = await prisma.semester.findUnique({ where: { id } });
        if (!existingSemester) {
            return NextResponse.json({ error: "Semester not found." }, { status: 404 });
        }

        // Ensure the semester belongs to the same college
        if (existingSemester.collegeId !== session.user.collegeId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Validate uniqueness for numerical, name, and alias within the college in a single query
        const conflictingSemester = await prisma.semester.findFirst({
            where: {
                collegeId: session.user.collegeId,
                OR: [
                    { numerical: data.numerical },
                    { name: data.name },
                    { alias: data.alias },
                ],
                id: { not: id }, // Exclude the current semester being updated
            },
        });

        if (conflictingSemester) {
            let conflictField = "numerical representation"; // Default conflict message
            if (conflictingSemester.numerical === data.numerical) {
                conflictField = "numerical representation";
            } else if (conflictingSemester.name === data.name) {
                conflictField = "name";
            } else if (conflictingSemester.alias === data.alias) {
                conflictField = "alias";
            }

            return NextResponse.json(
                { error: `A semester with the same ${conflictField} already exists in this college.` },
                { status: 409 }
            );
        }

        // Update the semester
        const updatedSemester = await prisma.semester.update({
            where: { id },
            data: { name, numerical, alias },
        });

        return NextResponse.json(updatedSemester, { status: 200 });
    } catch (error) {
        console.error("Error updating semester:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
