//api/statistics/[userId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, Prisma } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

type SessionUser = {
  id: string;
  role: "TEACHER" | "SBTE_ADMIN" | "HOD" | "COLLEGE_SUPER_ADMIN" | string;
};

const prisma = new PrismaClient();

async function getTeacherStatistics(userId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: {
      assignedSubjects: {
        include: {
          batchSubject: {
            include: {
              subject: true,
              batch: {
                include: {
                  studentBatches: true,
                  term: true, // Include the term relation
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  const totalSubjects = teacher.assignedSubjects.length;
  const totalStudents = teacher.assignedSubjects.reduce(
    (sum, assignedSubject) =>
      sum + assignedSubject.batchSubject.batch.studentBatches.length,
    0
  );

  const totalFeedbacks = await prisma.feedback.count({
    where: {
      batchSubjectId: {
        in: teacher.assignedSubjects.map((as) => as.batchSubjectId),
      },
    },
  });

  return {
    totalSubjects,
    totalStudents,
    totalFeedbacks,
    subjects: teacher.assignedSubjects.map((assignedSubject) => ({
      id: assignedSubject.batchSubject.subject.id,
      name: assignedSubject.batchSubject.subject.name,
      code: assignedSubject.batchSubject.subject.code,
      semester: assignedSubject.batchSubject.batch.term.name,
      studentCount: assignedSubject.batchSubject.batch.studentBatches.length,
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    if (
      user.role !== "TEACHER" &&
      user.role !== "SBTE_ADMIN" &&
      user.role !== "HOD" &&
      user.role !== "COLLEGE_SUPER_ADMIN"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const userId = user.role === "TEACHER" ? user.id : params.userId;

    if (!userId) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    }

    const data = await getTeacherStatistics(userId);

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
