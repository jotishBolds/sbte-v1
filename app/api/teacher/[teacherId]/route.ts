import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"

export async function GET(request: NextRequest, { params }: { params: { teacherId: string } }): Promise<NextResponse> {
    try {
        const teacherId = params.teacherId;

        // Fetch the session to validate the user
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        // Fetch the teacher by ID
        const teacher = await prisma.teacher.findUnique({
            where: {
                id: teacherId,
            },
            include: {
                user: {
                    include: {
                        college: true,
                        department: true,
                    },
                },
            },
        });

        // Check if the teacher exists
        if (!teacher) {
            return new NextResponse(JSON.stringify({ message: "Teacher not found" }), { status: 404 });
        }

        // Return the fetched teacher
        return NextResponse.json(teacher, { status: 200 });

    } catch (error) {
        console.error("Error fetching teacher:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
