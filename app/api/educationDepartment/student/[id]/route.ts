//File : /api/educationDepartment/student/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

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

    return NextResponse.json(student, { status: 200 });
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
