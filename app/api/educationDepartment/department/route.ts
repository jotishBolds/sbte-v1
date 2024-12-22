//File : /api/educationDepartment/department/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    session.user.role !== "SBTE_ADMIN" &&
    session.user.role !== "COLLEGE_ADMIN" &&
    session.user.role !== "EDUCATION_DEPARTMENT"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get("collegeId");

  if (!collegeId) {
    return NextResponse.json(
      { error: "collegeId is required for this request" },
      { status: 400 }
    );
  }

  try {
    const collegeExists = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!collegeExists) {
      return NextResponse.json(
        { error: "Invalid College ID" },
        { status: 400 }
      );
    }

    const departments = await prisma.department.findMany({
      where: { collegeId },
      select: {
        id: true,
        name: true,
        isActive: true,
        headOfDepartment: {
          select: {
            name: true,
          },
        },
      },
    });

    if (departments.length === 0) {
      return NextResponse.json(
        { message: "No departments found for the specified college" },
        { status: 200 }
      );
    }

    const departmentData = departments.map((department) => ({
      id: department.id,
      name: department.name,
      isActive: department.isActive,
      headOfDepartment: department.headOfDepartment?.name || null,
    }));

    return NextResponse.json(departmentData, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      {
        message: "Error fetching departments",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
