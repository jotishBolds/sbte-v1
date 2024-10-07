import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userRole = session.user.role;
    let statistics: any = {};

    switch (userRole) {
      case "SBTE_ADMIN":
        statistics = await getSBTEAdminStatistics();
        break;
      case "COLLEGE_SUPER_ADMIN":
      case "ADM":
        if (session.user.collegeId) {
          statistics = await getCollegeSuperAdminStatistics(
            session.user.collegeId
          );
        }
        break;
      case "HOD":
        if (session.user.departmentId) {
          statistics = await getHODStatistics(session.user.departmentId);
        }
        break;
      case "TEACHER":
        if (session.user.id) {
          statistics = await getTeacherStatistics(session.user.id);
        }
        break;
      case "STUDENT":
        if (session.user.id) {
          statistics = await getStudentStatistics(session.user.id);
        }
        break;
      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 400 }
        );
    }
    console.log("Fetched statistics:", statistics);
    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function getSBTEAdminStatistics() {
  const totalColleges = await prisma.college.count();
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.teacher.count();
  const totalDepartments = await prisma.department.count();

  return { totalColleges, totalStudents, totalTeachers, totalDepartments };
}
async function getTeacherStatistics(userId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: {
      subjects: {
        include: {
          _count: {
            select: { marks: true },
          },
        },
      },
    },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  const totalSubjects = teacher.subjects.length;
  const totalStudents = teacher.subjects.reduce(
    (sum, subject) => sum + subject._count.marks,
    0
  );
  const totalFeedbacks = await prisma.feedback.count({
    where: {
      subject: {
        teacherId: teacher.id,
      },
    },
  });

  return {
    totalSubjects,
    totalStudents,
    totalFeedbacks,
    subjects: teacher.subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
      studentCount: subject._count.marks,
    })),
  };
}

async function getCollegeSuperAdminStatistics(collegeId: string) {
  const totalDepartments = await prisma.department.count({
    where: { collegeId },
  });
  const totalStudents = await prisma.student.count({ where: { collegeId } });
  const totalTeachers = await prisma.teacher.count({
    where: { user: { collegeId } },
  });
  const totalSubjects = await prisma.subject.count({
    where: { department: { collegeId } },
  });

  return { totalDepartments, totalStudents, totalTeachers, totalSubjects };
}

async function getHODStatistics(departmentId: string) {
  const totalStudents = await prisma.student.count({ where: { departmentId } });
  const totalTeachers = await prisma.teacher.count({
    where: { subjects: { some: { departmentId } } },
  });
  const totalSubjects = await prisma.subject.count({ where: { departmentId } });
  const totalAlumni = await prisma.alumnus.count({ where: { departmentId } });

  return { totalStudents, totalTeachers, totalSubjects, totalAlumni };
}

async function getStudentStatistics(studentId: string) {
  const totalSubjects = await prisma.subject.count({
    where: { department: { students: { some: { id: studentId } } } },
  });
  const totalAttendance = await prisma.attendance.findMany({
    where: { studentId },
  });
  const averageAttendance =
    totalAttendance.length > 0
      ? totalAttendance.reduce((sum, att) => sum + att.percentage, 0) /
        totalAttendance.length
      : 0;
  const totalMarks = await prisma.mark.findMany({ where: { studentId } });
  const averageScore =
    totalMarks.length > 0
      ? totalMarks.reduce((sum, mark) => sum + mark.score, 0) /
        totalMarks.length
      : 0;

  return {
    totalSubjects,
    averageAttendance: Math.round(averageAttendance * 100) / 100,
    averageScore: Math.round(averageScore * 100) / 100,
  };
}
