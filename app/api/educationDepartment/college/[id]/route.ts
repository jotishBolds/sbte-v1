//File : /api/educationDepartment/college/[id]/route.ts

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
    // Validate user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "EDUCATION_DEPARTMENT" && session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = params.id;

    // Validate the college ID
    if (!collegeId) {
      return NextResponse.json(
        { error: "College ID is required" },
        { status: 400 }
      );
    }

    // Use Promise.all for parallel queries
    const [
      totalStaff,
      totalDepartments,
      totalStudents,
      totalTeachers,
      totalFinanceManager,
      totalSubjects,
      collegeDetails,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          collegeId,
          role: {
            in: [
              "HOD",
              "ADM",
              "TEACHER",
              "COLLEGE_SUPER_ADMIN",
              "FINANCE_MANAGER",
            ],
          },
        },
      }),
      prisma.department.count({ where: { collegeId } }),
      prisma.student.count({ where: { collegeId } }),
      prisma.teacher.count({
        where: { user: { collegeId } },
      }),
      prisma.financeManager.count({
        where: { user: { collegeId } },
      }),
      prisma.subject.count({ where: { collegeId } }),
      prisma.college.findUnique({
        where: { id: collegeId },
        select: {
          id: true,
          name: true,
          address: true,
          abbreviation: true,
          establishedOn: true,
          contactEmail: true,
          contactPhone: true,
          websiteUrl: true,
          logo: true,
        },
      }),
    ]);

    // Validate if college exists
    if (!collegeDetails) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Return the aggregated details
    return NextResponse.json(
      {
        college: collegeDetails,
        statistics: {
          totalStaff,
          totalDepartments,
          totalStudents,
          totalTeachers,
          totalFinanceManager,
          totalSubjects,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching College:", error);
    return NextResponse.json(
      { message: "Error fetching College", error: (error as Error).message },
      { status: 500 }
    );
  }
}
