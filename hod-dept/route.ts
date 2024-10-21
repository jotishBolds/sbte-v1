// app/api/departments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !["HOD", "COLLEGE_SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch a single department by ID
      const department = await prisma.department.findUnique({
        where: {
          id: id,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          headOfDepartment: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!department) {
        return NextResponse.json(
          { message: "Department not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(department);
    } else {
      // Fetch all departments for the college
      const collegeId = session.user.collegeId;
      if (!collegeId) {
        return NextResponse.json(
          { message: "College ID not found" },
          { status: 400 }
        );
      }

      const departments = await prisma.department.findMany({
        where: {
          collegeId: collegeId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          headOfDepartment: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json(departments);
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Error fetching departments" },
      { status: 500 }
    );
  }
}
