//File : /api/educationDepartment/student/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { hash } from "bcryptjs";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    session.user.role !== "SBTE_ADMIN" &&
    session.user.role !== "EDUCATION_DEPARTMENT"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get("collegeId");

  // Validate the collegeId parameter
  if (!collegeId) {
    return NextResponse.json(
      { error: "collegeId is required for this request" },
      { status: 400 }
    );
  }

  try {
    // Check if the college exists
    const collegeExists = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!collegeExists) {
      return NextResponse.json(
        { error: "Invalid College ID" },
        { status: 400 }
      );
    }

    // Fetch limited student data for the specified college
    const students = await prisma.student.findMany({
      where: {
        collegeId,
      },
      select: {
        id: true,
        name: true,
        studentAvatar: true,
        user: {
          select: {
            email: true,
          },
        },
        college: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        program: {
          select: {
            name: true,
          },
        },
        term: {
          select: {
            alias: true,
            name: true,
          },
        },
      },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { message: "No students found for the specified college" },
        { status: 200 }
      );
    }

    // Map the response to include only the necessary fields
    const studentData = students.map((student) => ({
      id: student.id,
      name: student.name,
      studentAvatar: student.studentAvatar,
      email: student.user.email,
      collegeName: student.college.name,
      departmentName: student.department.name,
      programName: student.program.name,
      semesterName: student.term.name,
      //   semesterAlias: student.term.alias,
    }));

    return NextResponse.json(studentData, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Error fetching students", error: (error as Error).message },
      { status: 500 }
    );
  }
}
