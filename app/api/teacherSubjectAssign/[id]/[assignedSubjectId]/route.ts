// api/teacherSubjectAssign/[id]/[assignedSubjectId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assignedSubjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "HOD" && session.user?.role !== "COLLEGE_SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: teacherId, assignedSubjectId } = params;

    // Check if the teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Check if the assigned subject exists
    const assignedSubject = await prisma.teacherAssignedSubject.findUnique({
      where: { id: assignedSubjectId },
    });

    if (!assignedSubject || assignedSubject.teacherId !== teacherId) {
      return NextResponse.json(
        {
          error:
            "Assigned subject not found or not associated with this teacher",
        },
        { status: 404 }
      );
    }

    // Delete the assigned subject
    await prisma.teacherAssignedSubject.delete({
      where: { id: assignedSubjectId },
    });

    return NextResponse.json(
      { message: "Subject unassigned from teacher successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unassigning subject from teacher:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
