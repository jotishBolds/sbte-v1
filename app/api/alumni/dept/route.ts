import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      session.user.role !== "COLLEGE_SUPER_ADMIN"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { message: "College ID not found" },
        { status: 400 }
      );
    }

    const departments = await prisma.department.findMany({
      where: {
        collegeId: collegeId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Error fetching departments" },
      { status: 500 }
    );
  }
}
