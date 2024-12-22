//File : /api/educationDepartment/department/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

async function getPassPercentage(departmentId: string) {
  // Fetch students with `PROMOTED` or `RESIT` statuses in the department
  const studentBatches = await prisma.studentBatch.findMany({
    where: {
      student: {
        departmentId,
      },
      batchStatus: {
        in: ["PROMOTED", "RESIT"], // Include both statuses
      },
    },
    include: {
      student: true,
    },
  });

  // Count the number of PROMOTED and RESIT statuses
  const totalRelevantStudents = studentBatches.length;
  const totalPromotedStudents = studentBatches.filter(
    (batch) => batch.batchStatus === "PROMOTED"
  ).length;

  // Calculate pass percentage
  const passPercentage =
    totalRelevantStudents > 0
      ? (totalPromotedStudents / totalRelevantStudents) * 100
      : 0;

  return passPercentage;
}

async function getHODStatistics(departmentId: string) {
  const totalStudents = await prisma.student.count({ where: { departmentId } });
  const totalTeachers = await prisma.teacher.count({
    where: {
      assignedSubjects: {
        some: {
          batchSubject: {
            batch: {
              program: {
                departmentId,
              },
            },
          },
        },
      },
    },
  });
  const totalSubjects = await prisma.subject.count({
    where: {
      batchSubjects: {
        some: {
          batch: {
            program: {
              departmentId,
            },
          },
        },
      },
    },
  });
  const totalAlumni = await prisma.alumnus.count({ where: { departmentId } });

  let passPercentage = await getPassPercentage(departmentId);
  passPercentage = Math.round(passPercentage);

  const unassignedSubjectsCount = await prisma.batchSubject.count({
    where: {
      batch: {
        program: { departmentId },
        status: true,
      },
      teacherAssignments: {
        none: {},
      },
    },
  });

  return {
    totalStudents,
    totalTeachers,
    totalSubjects,
    totalAlumni,
    passPercentage,
    unassignedSubjectsCount,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const departmentId = params.id;

  if (!departmentId) {
    return NextResponse.json(
      { error: "Department ID is required" },
      { status: 400 }
    );
  }

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        headOfDepartment: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        programs: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const hodStatistics = await getHODStatistics(departmentId);

    const departmentData = {
      id: department.id,
      name: department.name,
      isActive: department.isActive,
      college: department.college,
      headOfDepartment: department.headOfDepartment || null,
      programs: department.programs,
      statistics: hodStatistics,
    };

    return NextResponse.json(departmentData, { status: 200 });
  } catch (error) {
    console.error("Error fetching department details:", error);
    return NextResponse.json(
      {
        message: "Error fetching department details",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
