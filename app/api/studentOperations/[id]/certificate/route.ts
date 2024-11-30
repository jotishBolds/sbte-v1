// File : /api/studentOperations/[id]/certificate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

// Initialize Prisma Client
const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;
    const userId = session.user?.id;

    // First, get the student record to check authorization
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        college: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if the user is authorized to access this student's data
    const isAuthorized =
      student.userId === userId || // User is the student
      (session.user?.role === "COLLEGE_SUPER_ADMIN" &&
        session.user?.collegeId === student.collegeId); // User is admin of the same college

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch certificates for the given student
    const certificates = await prisma.certificate.findMany({
      where: {
        studentId,
      },
      orderBy: { createdAt: "asc" },
      include: {
        certificateType: true,
      },
    });

    if (certificates.length === 0) {
      return NextResponse.json(
        { message: "No certificate issuances found for the student" },
        { status: 404 }
      );
    }

    return NextResponse.json(certificates, { status: 200 });
  } catch (error) {
    console.error("Error retrieving certificates:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
