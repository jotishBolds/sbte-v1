// File: app/api/gradeCard/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gradeCardId = params.id;

    const gradeCard = await prisma.studentGradeCard.findUnique({
      where: { id: gradeCardId },
      include: {
        student: true,
        semester: true,
        batch: true,
        subjectGrades: {
          include: {
            batchSubject: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!gradeCard) {
      return NextResponse.json(
        { error: "Grade card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(gradeCard);
  } catch (error) {
    console.error("Error fetching grade card:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while fetching grade card.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["COLLEGE_SUPER_ADMIN"];
    if (!allowedRoles.includes(session.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    const gradeCardId = params.id;

    // Check if the StudentGradeCard exists and belongs to the college
    const existingCard = await prisma.studentGradeCard.findFirst({
      where: {
        id: gradeCardId,
        student: {
          collegeId: collegeId,
        },
      },
      include: {
        subjectGrades: true,
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        {
          error:
            "StudentGradeCard not found or does not belong to the user's college",
        },
        { status: 404 }
      );
    }

    // Perform transaction to delete SubjectGradeDetails first, then the StudentGradeCard
    await prisma.$transaction([
      prisma.subjectGradeDetail.deleteMany({
        where: {
          studentGradeCardId: gradeCardId,
        },
      }),
      prisma.studentGradeCard.delete({
        where: {
          id: gradeCardId,
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "StudentGradeCard and its subject grades deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting StudentGradeCard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
