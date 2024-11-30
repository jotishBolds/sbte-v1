// app/api/student/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    // Get the student record for the logged-in user
    const student = await prisma.student.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        enrollmentNo: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error("Error retrieving student:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
