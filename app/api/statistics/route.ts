//api/statistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
      assignedSubjects: {
        include: {
          batchSubject: {
            include: {
              subject: true,
              examMarks: true,
              batch: {
                include: {
                  term: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  const totalSubjects = teacher.assignedSubjects.length;
  const totalStudents = await prisma.studentBatch.count({
    where: {
      batch: {
        batchSubjects: {
          some: {
            teacherAssignments: {
              some: {
                teacherId: teacher.id,
              },
            },
          },
        },
      },
    },
  });

  const totalFeedbacks = await prisma.feedback.count({
    where: {
      teacherAssignedSubject: {
        teacherId: teacher.id,
      },
    },
  });

  const subjects = teacher.assignedSubjects.map((assignment) => ({
    id: assignment.batchSubject.subject.id,
    name: assignment.batchSubject.subject.name,
    code: assignment.batchSubject.subject.code,
    semester: assignment.batchSubject.batch.term.name,
    studentCount: assignment.batchSubject.examMarks.length,
  }));

  return {
    totalSubjects,
    totalStudents,
    totalFeedbacks,
    subjects,
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
    where: { collegeId },
  });

  return { totalDepartments, totalStudents, totalTeachers, totalSubjects };
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

  return { totalStudents, totalTeachers, totalSubjects, totalAlumni };
}

async function getStudentStatistics(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      studentBatches: {
        include: {
          batch: {
            include: {
              batchSubjects: true,
            },
          },
        },
      },
      monthlyAttendance: {
        include: {
          monthlyBatchSubjectClasses: true,
        },
      },
      examMarks: true,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const totalSubjects = student.studentBatches.reduce(
    (sum, sb) => sum + sb.batch.batchSubjects.length,
    0
  );

  const averageAttendance =
    student.monthlyAttendance.length > 0
      ? student.monthlyAttendance.reduce(
          (sum, att) =>
            sum +
            (att.attendedTheoryClasses + att.attendedPracticalClasses) /
              (att.monthlyBatchSubjectClasses.totalTheoryClasses +
                att.monthlyBatchSubjectClasses.totalPracticalClasses),
          0
        ) / student.monthlyAttendance.length
      : 0;

  const averageScore =
    student.examMarks.length > 0
      ? student.examMarks.reduce(
          (sum, mark) => sum + Number(mark.achievedMarks),
          0
        ) / student.examMarks.length
      : 0;

  return {
    totalSubjects,
    averageAttendance: Math.round(averageAttendance * 100) / 100,
    averageScore: Math.round(averageScore * 100) / 100,
  };
}
