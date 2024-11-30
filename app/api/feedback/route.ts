//File  : /api/feedback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user?.role !== "HOD" &&
      session.user?.role !== "STUDENT"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let studentId: string | undefined;

    if (session.user.role === "STUDENT") {
      const studentUserId = session.user.id;
      if (!studentUserId) {
        return NextResponse.json(
          { error: "Student User Id not found in the session." },
          { status: 404 }
        );
      }

      const student = await prisma.student.findUnique({
        where: { userId: studentUserId },
      });
      if (!student) {
        return NextResponse.json(
          { error: "Student not found." },
          { status: 404 }
        );
      }
      studentId = student?.id;
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const batchSubjectId = searchParams.get("batchSubjectId");
    const teacherId = searchParams.get("teacherId");

    const whereClause: any = {
      batchSubject: {
        batch: {
          program: {
            department: {
              collegeId,
            },
          },
        },
      },
    };

    // If studentId is provided, modify the whereClause to fetch feedbacks for the student
    if (studentId) {
      whereClause["studentId"] = studentId;
    }

    if (batchSubjectId) {
      whereClause["batchSubjectId"] = batchSubjectId;
    }

    if (teacherId) {
      whereClause["batchSubject"]["teacherAssignments"] = {
        some: {
          teacherId,
        },
      };
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentNo: true,
          },
        },
        batchSubject: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            teacherAssignments: {
              select: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (feedbacks.length === 0) {
      return NextResponse.json(
        { message: "No feedback found" },
        { status: 200 }
      );
    }

    const responseData = feedbacks.map((feedback) => ({
      id: feedback.id,
      content: feedback.content,
      stars: feedback.stars,
      student: feedback.student
        ? {
            id: feedback.student.id,
            name: feedback.student.name,
            enrollmentNo: feedback.student.enrollmentNo,
          }
        : null,
      batchSubject: feedback.batchSubject
        ? {
            id: feedback.batchSubject.id,
            subject: feedback.batchSubject.subject
              ? {
                  id: feedback.batchSubject.subject.id,
                  name: feedback.batchSubject.subject.name,
                }
              : null,
            teachers: feedback.batchSubject.teacherAssignments.map(
              (assignment) => ({
                id: assignment.teacher.id,
                name: assignment.teacher.name,
              })
            ),
          }
        : null,
      createdAt: feedback.createdAt,
    }));

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Define Zod schema for Feedback validation
const feedbackSchema = z.object({
  batchSubjectId: z.string({
    required_error: "BatchSubject ID is required.",
  }),
  content: z.string().optional(),
  stars: z.number().min(1).max(5, "Stars must be between 1 and 5."),
});

// Middleware: Validate if the student belongs to the batch
async function validateStudentInBatch(
  studentId: string,
  batchSubjectId: string
) {
  // Fetch BatchSubject details
  const batchSubject = await prisma.batchSubject.findUnique({
    where: { id: batchSubjectId },
    include: { batch: true },
  });

  if (!batchSubject) {
    throw new Error("BatchSubject not found.");
  }

  // Check if the student is in the batch
  const studentBatch = await prisma.studentBatch.findFirst({
    where: {
      studentId,
      batchId: batchSubject.batchId,
    },
  });

  if (!studentBatch) {
    throw new Error(
      "Student does not belong to the batch associated with this BatchSubject."
    );
  }

  const existingFeedback = await prisma.feedback.findFirst({
    where: {
      studentId,
      batchSubjectId,
    },
  });

  if (existingFeedback) {
    throw new Error(
      "Feedback for this BatchSubject has already been provided by the student."
    );
  }

  return true;
}

// POST: Create feedback
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentUserId = session.user.id;
    if (!studentUserId) {
      return NextResponse.json(
        { error: "Student User Id not found in the session." },
        { status: 404 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found." },
        { status: 404 }
      );
    }
    const studentId = student?.id;

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();

    // Validate input with Zod
    const validationResult = feedbackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { batchSubjectId, content, stars } = validationResult.data;

    // Check if student belongs to the batch
    await validateStudentInBatch(studentId, batchSubjectId);

    // Create feedback and immediately fetch it with full details
    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        batchSubjectId,
        content,
        stars,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentNo: true,
          },
        },
        batchSubject: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            teacherAssignments: {
              select: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Map the feedback to match the GET response structure
    const responseFeedback = {
      id: feedback.id,
      content: feedback.content,
      stars: feedback.stars,
      student: feedback.student
        ? {
            id: feedback.student.id,
            name: feedback.student.name,
            enrollmentNo: feedback.student.enrollmentNo,
          }
        : null,
      batchSubject: feedback.batchSubject
        ? {
            id: feedback.batchSubject.id,
            subject: feedback.batchSubject.subject
              ? {
                  id: feedback.batchSubject.subject.id,
                  name: feedback.batchSubject.subject.name,
                }
              : null,
            teachers: feedback.batchSubject.teacherAssignments.map(
              (assignment) => ({
                id: assignment.teacher.id,
                name: assignment.teacher.name,
              })
            ),
          }
        : null,
      createdAt: feedback.createdAt,
    };

    return NextResponse.json(responseFeedback, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}
