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
    console.log(userRole);

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
      case "ALUMNUS":
        if (session.user.id) {
          statistics = await getAlumnusStatistics(session.user.id);
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
      case "FINANCE_MANAGER":
        if (session.user.id) {
          statistics = await getFinanceManagerStatistics(session.user.id);
        }
        break;
      case "EDUCATION_DEPARTMENT":
        statistics = await getEducationDepartmentStatistics();
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
      batchSubjectId: {
        in: teacher.assignedSubjects.map(
          (assignment) => assignment.batchSubjectId
        ),
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
          StudentBatchExamFee: true,
        },
      },
      monthlyAttendance: {
        include: {
          monthlyBatchSubjectClasses: true,
        },
      },
      examMarks: {
        include: {
          examType: true,
        },
      },
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
      ? (() => {
          let totalAttendedClasses = 0;
          let totalClasses = 0;

          student.monthlyAttendance.forEach((att) => {
            const totalTheory =
              att.monthlyBatchSubjectClasses.totalTheoryClasses ?? 0;
            const totalPractical =
              att.monthlyBatchSubjectClasses.totalPracticalClasses ?? 0;
            const attendedTheory = att.attendedTheoryClasses ?? 0;
            const attendedPractical = att.attendedPracticalClasses ?? 0;

            const monthTotalClasses = totalTheory + totalPractical;

            if (monthTotalClasses > 0) {
              totalClasses += monthTotalClasses;
              totalAttendedClasses += attendedTheory + attendedPractical;
            }
          });

          return totalClasses > 0
            ? (totalAttendedClasses / totalClasses) * 100
            : 0;
        })()
      : 0;

  const averageScore =
    student.examMarks.length > 0
      ? (() => {
          let totalPercentage = 0;
          let validEntries = 0;

          student.examMarks.forEach((examMark) => {
            if (
              examMark.wasAbsent ||
              examMark.debarred ||
              examMark.malpractice
            ) {
              return;
            }

            const totalMarks = examMark.examType.totalMarks.toNumber();
            const achievedMarks = examMark.achievedMarks.toNumber();

            if (totalMarks > 0) {
              const percentage = (achievedMarks / totalMarks) * 100;
              totalPercentage += percentage;
              validEntries++;
            }
          });

          return validEntries > 0 ? totalPercentage / validEntries : 0;
        })()
      : 0;

  // Calculate fees data
  const feesData = student.studentBatches.reduce(
    (acc, studentBatch) => {
      const pendingFees = studentBatch.StudentBatchExamFee.filter(
        (fee) => fee.paymentStatus === "PENDING"
      );

      const totalPendingAmount = pendingFees.reduce(
        (sum, fee) => sum + fee.examFee,
        0
      );

      const completedFees = studentBatch.StudentBatchExamFee.filter(
        (fee) => fee.paymentStatus === "COMPLETED"
      );

      const totalCompletedAmount = completedFees.reduce(
        (sum, fee) => sum + fee.examFee,
        0
      );

      acc.totalPendingAmount += totalPendingAmount;
      acc.totalCompletedAmount += totalCompletedAmount;
      acc.pendingFeesCount += pendingFees.length; // Count of PENDING fees

      return acc;
    },
    { totalPendingAmount: 0, totalCompletedAmount: 0, pendingFeesCount: 0 }
  );

  // Fetch the latest batch
  const latestBatch = student.studentBatches.sort((a, b) =>
    a.batch.createdAt > b.batch.createdAt ? -1 : 1
  )[0]; // Assuming createdAt is the key to identify the latest batch

  let latestBatchAverageAttendance = 0;
  let latestBatchAverageScore = 0;

  if (latestBatch) {
    // Fetch exam marks for the latest batch
    const latestBatchSubjects = latestBatch.batch.batchSubjects;

    const latestBatchExamMarks = await prisma.examMark.findMany({
      where: {
        studentId: student.id,
        batchSubjectId: {
          in: latestBatchSubjects.map((subject) => subject.id),
        },
      },
      include: {
        examType: true,
      },
    });

    if (latestBatchExamMarks.length > 0) {
      let totalMarksPercentage = 0;
      let validEntries = 0;

      latestBatchExamMarks.forEach((examMark) => {
        if (
          !examMark.wasAbsent &&
          !examMark.debarred &&
          !examMark.malpractice
        ) {
          const totalMarks = examMark.examType.totalMarks.toNumber();
          const totalAchieved = examMark.achievedMarks.toNumber();
          totalMarksPercentage += (totalAchieved / totalMarks) * 100;
          validEntries++;
        }
      });

      latestBatchAverageScore = totalMarksPercentage / validEntries;
    }
    // Fetch attendance for the latest batch
    const latestBatchAttendance =
      await prisma.monthlyBatchSubjectAttendance.findMany({
        where: {
          studentId: student.id,
          monthlyBatchSubjectClasses: {
            batchSubjectId: {
              in: latestBatchSubjects.map((subject) => subject.id),
            },
          },
        },
        include: {
          monthlyBatchSubjectClasses: true,
        },
      });

    if (latestBatchAttendance.length > 0) {
      let totalAttendedClasses = 0;
      let totalClasses = 0;

      latestBatchAttendance.forEach((att) => {
        const totalTheory =
          att.monthlyBatchSubjectClasses.totalTheoryClasses ?? 0;
        const totalPractical =
          att.monthlyBatchSubjectClasses.totalPracticalClasses ?? 0;
        const attendedTheory = att.attendedTheoryClasses ?? 0;
        const attendedPractical = att.attendedPracticalClasses ?? 0;

        const monthTotalClasses = totalTheory + totalPractical;

        if (monthTotalClasses > 0) {
          totalClasses += monthTotalClasses;
          totalAttendedClasses += attendedTheory + attendedPractical;
        }
      });

      latestBatchAverageAttendance =
        totalClasses > 0 ? (totalAttendedClasses / totalClasses) * 100 : 0;
    }
  }

  return {
    totalSubjects,
    averageAttendance: Math.round(averageAttendance * 100) / 100,
    averageScore: Math.round(averageScore * 100) / 100,
    totalPendingAmount: feesData.totalPendingAmount,
    totalCompletedAmount: feesData.totalCompletedAmount,
    pendingFeesCount: feesData.pendingFeesCount,
    latestBatchAverageAttendance:
      Math.round(latestBatchAverageAttendance * 100) / 100,
    latestBatchAverageScore: Math.round(latestBatchAverageScore * 100) / 100,
  };
}

async function getAlumnusStatistics(userId: string) {
  const alumnus = await prisma.alumnus.findUnique({
    where: { userId },
    include: {
      department: true,
      program: true,
      batchYear: true,
      admissionYear: true,
    },
  });

  if (!alumnus) {
    throw new Error("Alumnus not found");
  }

  return {
    name: alumnus.name,
    department: alumnus.department.name,
    program: alumnus.program.name,
    batchYear: alumnus.batchYear.year,
    admissionYear: alumnus.admissionYear.year,
    graduationYear: alumnus.graduationYear,
    jobStatus: alumnus.jobStatus,
    currentEmployer: alumnus.currentEmployer,
    currentPosition: alumnus.currentPosition,
    industry: alumnus.industry,
    gpa: alumnus.gpa,
    verified: alumnus.verified,
  };
}
async function getFinanceManagerStatistics(userId: string) {
  const financeManager = await prisma.financeManager.findUnique({
    where: { userId },
    include: { college: true },
  });

  if (!financeManager) {
    throw new Error("Finance Manager not found");
  }

  const totalFees = await prisma.payment.aggregate({
    where: {
      studentBatchExamFees: {
        some: {
          studentBatch: {
            student: {
              user: {
                collegeId: financeManager.collegeId,
              },
            },
          },
        },
      },
    },
    _sum: {
      amount: true,
    },
  });
  const totalFeePayments = totalFees._sum.amount || 0;

  const totalPendingExamFee = await prisma.studentBatchExamFee.aggregate({
    where: {
      studentBatch: {
        student: {
          user: {
            collegeId: financeManager.collegeId,
          },
        },
      },
      paymentStatus: "PENDING",
    },
    _sum: {
      examFee: true,
    },
  });
  const totalPendingPayments = totalPendingExamFee._sum.examFee || 0;

  const totalCompletedExamFee = await prisma.studentBatchExamFee.aggregate({
    where: {
      studentBatch: {
        student: {
          user: {
            collegeId: financeManager.collegeId,
          },
        },
      },
      paymentStatus: "COMPLETED",
    },
    _sum: {
      examFee: true,
    },
  });
  const totalCompletedPayments = totalCompletedExamFee._sum.examFee || 0;

  const totalExamFee = await prisma.studentBatchExamFee.aggregate({
    where: {
      studentBatch: {
        student: {
          user: {
            collegeId: financeManager.collegeId,
          },
        },
      },
    },
    _sum: {
      examFee: true,
    },
  });
  const totalExamFees = totalExamFee._sum.examFee || 0;

  // const totalExamFees = await prisma.studentBatchExamFee.aggregate({
  //   where: {
  //     studentBatch: {
  //       student: { collegeId: financeManager.collegeId },
  //     },
  //   },
  //   _sum: { examFee: true },
  // });

  // const totalPendingPayments = await prisma.feePayment.count({
  //   where: {
  //     student: { collegeId: financeManager.collegeId },
  //     paymentStatus: "PENDING",
  //   },
  // });

  // const totalCompletedPayments = await prisma.feePayment.count({
  //   where: {
  //     student: { collegeId: financeManager.collegeId },
  //     paymentStatus: "COMPLETED",
  //   },
  // });

  // const totalRevenue = await prisma.feePayment.aggregate({
  //   where: {
  //     student: { collegeId: financeManager.collegeId },
  //     paymentStatus: "COMPLETED",
  //   },
  //   _sum: { amount: true },
  // });

  return {
    totalFeePayments,
    totalPendingPayments,
    totalCompletedPayments,
    // totalRevenue: totalRevenue._sum.amount || 0,
    totalExamFees: totalExamFees || 0,
  };
}

async function getEducationDepartmentStatistics() {
  const totalColleges = await prisma.college.count();
  const totalDepartments = await prisma.department.count();
  const totalPrograms = await prisma.program.count();
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.teacher.count();

  return {
    totalColleges,
    totalDepartments,
    totalPrograms,
    totalStudents,
    totalTeachers,
  };
}
