import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

// Define a type for the session user
type SessionUser = {
  id: string;
  role: "TEACHER" | "SBTE_ADMIN" | string;
};

const prisma = new PrismaClient();

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
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    // Fetch session to validate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Ensure the session user is a teacher or admin
    if (user.role !== "TEACHER" && user.role !== "SBTE_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Fetch the userId from the session for teachers or from the URL for admins
    const userId = user.role === "TEACHER" ? user.id : params.userId;

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    }

    // Fetch teacher statistics
    const data = await getTeacherStatistics(userId);

    // Return the statistics
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching teacher statistics:", error);

    if (error instanceof Error && error.message === "Teacher not found") {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
