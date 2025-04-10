//File : app/api/subjectGradeDetail/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";

const prisma = new PrismaClient();

// const subjectGradeUpdateSchema = z.object({
//   internalMarks: z.number().min(0).max(30).optional(),
//   externalMarks: z.number().min(0).max(70).optional(),
// });

const subjectGradeUpdateSchema = z.object({
  internalMarks: z
    .number({ invalid_type_error: "Internal marks must be a number" })
    .min(0, { message: "Internal marks cannot be negative" })
    .max(30, { message: "Internal marks should not exceed 30" })
    .optional(),
  externalMarks: z
    .number({ invalid_type_error: "External marks must be a number" })
    .min(0, { message: "External marks cannot be negative" })
    .max(70, { message: "External marks should not exceed 70" })
    .optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "College not found in the session" },
        { status: 404 }
      );
    }

    const subjectGradeDetailId = params.id;
    const body = await request.json();
    const validation = subjectGradeUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { internalMarks, externalMarks } = validation.data;

    const subjectGrade = await prisma.subjectGradeDetail.findFirst({
      where: {
        id: subjectGradeDetailId,
        studentGradeCard: {
          student: {
            collegeId: collegeId,
          },
        },
      },
    });

    if (!subjectGrade) {
      return NextResponse.json(
        {
          error:
            "SubjectGradeDetail not found or does not belong to the user's college",
        },
        { status: 404 }
      );
    }

    const updated = await prisma.subjectGradeDetail.update({
      where: { id: subjectGradeDetailId },
      data: {
        internalMarks,
        externalMarks,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating SubjectGradeDetail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["COLLEGE_SUPER_ADMIN", "TEACHER"];
    if (!allowedRoles.includes(session.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "College not found in the session" },
        { status: 404 }
      );
    }

    const subjectGradeDetailId = params.id;

    // Check if SubjectGradeDetail exists and belongs to the college
    const subjectGrade = await prisma.subjectGradeDetail.findFirst({
      where: {
        id: subjectGradeDetailId,
        studentGradeCard: {
          student: {
            collegeId: collegeId,
          },
        },
      },
      include: {
        studentGradeCard: {
          select: {
            id: true,
            subjectGrades: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!subjectGrade) {
      return NextResponse.json(
        {
          error:
            "SubjectGradeDetail not found or does not belong to the user's college",
        },
        { status: 404 }
      );
    }

    const studentGradeCardId = subjectGrade.studentGradeCard.id;
    const totalSubjects = subjectGrade.studentGradeCard.subjectGrades.length;

    // Used a transaction to delete both if it's the last one
    await prisma.$transaction(async (tx) => {
      await tx.subjectGradeDetail.delete({
        where: { id: subjectGradeDetailId },
      });

      if (totalSubjects === 1) {
        await tx.studentGradeCard.delete({
          where: { id: studentGradeCardId },
        });
      }
    });

    return NextResponse.json(
      {
        message:
          totalSubjects === 1
            ? "SubjectGradeDetail and StudentGradeCard deleted successfully"
            : "SubjectGradeDetail deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting SubjectGradeDetail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
