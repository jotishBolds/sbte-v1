// File: app/api/teachers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !["HOD", "COLLEGE_SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { message: "College ID not found" },
        { status: 400 }
      );
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        user: {
          collegeId: collegeId,
        },
      },
      select: {
        id: true,
        name: true,
        user: {
          select: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      departmentId: teacher.user.department?.id,
      departmentName: teacher.user.department?.name,
    }));

    return NextResponse.json(formattedTeachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { message: "Error fetching teachers" },
      { status: 500 }
    );
  }
}
