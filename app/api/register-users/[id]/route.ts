//api/register-users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

// Helper function to get admin's college ID
async function getAdminCollege(userId: string) {
  const adminUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { college: true },
  });

  if (!adminUser || !adminUser.college) {
    throw new Error("College not found");
  }

  return adminUser.college.id;
}

// GET request handler
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const collegeId = await getAdminCollege(session.user.id);

    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        collegeId: collegeId,
      },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}

// PUT request handler
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.collegeId) {
    return NextResponse.json(
      { message: "College not associated with admin" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { username, email, role } = body;

    const updatedUser = await prisma.user.updateMany({
      where: {
        id: params.id,
        collegeId: session.user.collegeId,
      },
      data: { username, email, role },
    });

    if (updatedUser.count === 0) {
      return NextResponse.json(
        { message: "User not found or not in your college" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE request handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = params.id;

    // Delete related records first
    await prisma.headOfDepartment.deleteMany({
      where: { userId: id },
    });

    await prisma.teacher.deleteMany({
      where: { userId: id },
    });

    await prisma.financeManager.deleteMany({
      where: { userId: id },
    });

    await prisma.student.deleteMany({
      where: { userId: id },
    });

    await prisma.alumnus.deleteMany({
      where: { userId: id },
    });

    // Now delete the user
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error: (error as Error).message },
      { status: 500 }
    );
  }
}
