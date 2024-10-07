// app/api/colleges/[id]/departments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const departments = await prisma.department.findMany({
      where: {
        collegeId: id,
        isActive: true, // Only fetch active departments
      },
      include: { headOfDepartment: true },
    });
    // Check if the departments array is empty
    if (departments.length === 0) {
      return NextResponse.json(
        { message: "No departments found for this college" },
        { status: 404 }
      );
    }

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching college departments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
