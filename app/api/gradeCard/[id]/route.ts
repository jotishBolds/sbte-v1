// File: app/api/gradeCard/[id]/route.ts
import { NextResponse } from "next/server";
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
