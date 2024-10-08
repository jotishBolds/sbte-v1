// api/programs/[id]/semesters/[semesterId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: { id: string; semesterId: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const collegeId = session.user.collegeId;
        if (!collegeId) {
            return NextResponse.json({ error: "User is not associated with a college" }, { status: 400 });
        }

        const programId = params.id;
        const semesterId = params.semesterId;

        // Check if the association exists by querying both programId and semesterId
        const existingAssociation = await prisma.semesterProgram.findFirst({
            where: {
                programId,
                semesterId,
            },
        });

        if (!existingAssociation) {
            return NextResponse.json({ error: "No association found to delete." }, { status: 404 });
        }

        // Delete the association
        await prisma.semesterProgram.delete({
            where: {
                id: existingAssociation.id, // Delete using the found association's ID
            },
        });

        return NextResponse.json({ message: "Semester association deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error deleting semester association:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
