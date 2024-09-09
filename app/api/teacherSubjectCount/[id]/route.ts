import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"

async function getTeacherStatistics(userId: string) {
    const teacher = await prisma.teacher.findUnique({
        where: { userId },
        include: {
            subjects: {
                include: {
                    _count: {
                        select: { marks: true },
                    },
                },
            },
        },
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    const totalSubjects = teacher.subjects.length;
    const totalStudents = teacher.subjects.reduce(
        (sum, subject) => sum + subject._count.marks,
        0
    );
    const totalFeedbacks = await prisma.feedback.count({
        where: {
            subject: {
                teacherId: teacher.id,
            },
        },
    });

    return {
        totalSubjects,
        totalStudents,
        totalFeedbacks,
        subjects: teacher.subjects.map((subject) => ({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            semester: subject.semester,
            studentCount: subject._count.marks,
        })),
    };
}


export async function GET(
    request: NextRequest, 
    { params }: { params: {id: string } }
  ): Promise<NextResponse> {
    try {
        // Fetch session to validate the user
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        // Ensure the session user is a teacher or admin
        // if (session.user.role !== "TEACHER" && session.user.role !== "SBTE_ADMIN") {
        //     return new NextResponse(JSON.stringify({ message: "Forbidden" }), { status: 403 });
        // }

        // Fetch the userId from the session for teachers or from the URL for admins
        const userId = session.user.role === "TEACHER" ? session.user.id : params.id;

        // Fetch teacher statistics
        const data = await getTeacherStatistics(userId);

        // Return the statistics
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Error fetching teacher statistics:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
  }