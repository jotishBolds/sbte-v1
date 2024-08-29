import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth";

const prisma = new PrismaClient();

interface DepartmentCreationData {
  name: string;
  collegeId: string;
  isActive: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data: DepartmentCreationData = await request.json();

    // Validate required fields
    if (!data.name || !data.collegeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new department
    const newDepartment = await prisma.department.create({
      data: {
        name: data.name,
        isActive: data.isActive,
        college: {
          connect: {
            id: data.collegeId,
          },
        },
      },
    });

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow access for SBTE_ADMIN and COLLEGE_SUPER_ADMIN
    if (
      session.user.role !== "SBTE_ADMIN" &&
      session.user.role !== "COLLEGE_SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let departments;

    if (session.user.role === "SBTE_ADMIN") {
      // SBTE_ADMIN can see all departments
      departments = await prisma.department.findMany({
        include: {
          college: {
            select: {
              name: true,
            },
          },
        },
      });
    } else if (session.user.role === "COLLEGE_SUPER_ADMIN") {
      // COLLEGE_SUPER_ADMIN can only see departments of their college
      if (!session.user.collegeId) {
        return NextResponse.json(
          { error: "College ID not found for user" },
          { status: 400 }
        );
      }
      departments = await prisma.department.findMany({
        where: {
          collegeId: session.user.collegeId,
        },
        include: {
          college: {
            select: {
              name: true,
            },
          },
        },
      });
    }

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
