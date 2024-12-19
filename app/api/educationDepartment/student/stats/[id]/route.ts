//File : /api/educationDepartment/student/stats/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

async function getStudentStatistics(id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentId = params.id;

  // Validate the studentId parameter
  if (!studentId) {
    return NextResponse.json(
      { error: "Student ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch the student details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        studentAvatar: true,
        enrollmentNo: true,
        dob: true,
        gender: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            code: true,
            alias: true,
          },
        },
        term: {
          select: {
            id: true,
            name: true,
            alias: true,
          },
        },
        batchYear: {
          select: {
            id: true,
            year: true,
          },
        },
        admissionYear: {
          select: {
            id: true,
            year: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        studentBatches: {
          select: {
            id: true,
            studentId: true,
            batchId: true,
            batchStatus: true,
            batch: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            StudentBatchExamFee: {
              select: {
                id: true,
                reason: true,
                examFee: true,
                dueDate: true,
                paymentStatus: true,
              },
            },
          },
        },
        monthlyAttendance: {
          select: {
            id: true,
            attendedTheoryClasses: true,
            attendedPracticalClasses: true,
            monthlyBatchSubjectClasses: {
              select: {
                id: true,
                month: true,
                totalTheoryClasses: true,
                totalPracticalClasses: true,
                completedTheoryClasses: true,
                completedPracticalClasses: true,
                batchSubject: {
                  select: {
                    id: true,
                    creditScore: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        code: true,
                        alias: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        certificates: {
          select: {
            id: true,
            issueDate: true,
            paymentStatus: true,
            certificateType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        examMarks: {
          select: {
            id: true,
            achievedMarks: true,
            wasAbsent: true,
            debarred: true,
            malpractice: true,
            batchSubject: {
              select: {
                id: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
                subjectType: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            examType: {
              select: {
                id: true,
                examName: true,
                totalMarks: true,
                passingMarks: true,
              },
            },
          },
        },
      },
    });

    // Check if student exists
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const statistics = await getStudentStatistics(studentId);

    return NextResponse.json({ student, statistics }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      {
        error: "Error fetching student details",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
