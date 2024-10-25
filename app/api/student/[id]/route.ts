import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

// GET student by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    session.user.role != "COLLEGE_SUPER_ADMIN" && session.user.role != "HOD"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch the student by ID, including necessary relations
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        program: true,
        department: true,
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Ensure collegeId matches the user’s college if the role requires it
    if (
      // (session.user.role === "COLLEGE_SUPER_ADMIN" || session.user.role === "HOD") &&
      student.collegeId !== session.user.collegeId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ message: "Error fetching student", error: (error as Error).message }, { status: 500 });
  }
}

// UPDATE student by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    session.user.role != "COLLEGE_SUPER_ADMIN" && session.user.role != "HOD"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse the request body
  const data = await request.json();

  try {
    // Fetch student to verify existence and college match if needed
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    if (
      student.collegeId !== session.user.collegeId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the student record
    const updatedStudent = await prisma.student.update({
      where: { id },
      data,
    });

    return NextResponse.json({ student: updatedStudent }, { status: 200 });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ message: "Error updating student", error: (error as Error).message }, { status: 500 });
  }
}

// DELETE student by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "HOD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch student to verify existence and retrieve userId for deletion
    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        userId: true,
        collegeId: true,
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Check if the student's collegeId matches the session user's collegeId
    if (student.collegeId !== session.user.collegeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the student and associated user in a transaction
    await prisma.$transaction([
      prisma.student.delete({ where: { id } }),
      prisma.user.delete({ where: { id: student.userId } }),
    ]);

    return NextResponse.json({ message: "Student and associated user deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting student and user:", error);
    return NextResponse.json(
      { message: "Error deleting student and associated user", error: (error as Error).message },
      { status: 500 }
    );
  }
}
