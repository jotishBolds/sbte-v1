// File: app/api/gradeCard/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gradeCards = await prisma.studentGradeCard.findMany({
      include: {
        student: true,
        semester: true,
        batch: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(gradeCards);
  } catch (error) {
    console.error("Error fetching grade cards:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while fetching grade cards.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
