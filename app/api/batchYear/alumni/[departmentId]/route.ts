// api/batchYear/alumni/[departmentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { departmentId: string } }
) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: params.departmentId },
      include: { college: true },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const batchYears = await prisma.batchYear.findMany({
      where: { collegeId: department.college.id },
      orderBy: { year: "desc" },
    });

    return NextResponse.json(batchYears, { status: 200 });
  } catch (error) {
    console.error("Error fetching batch years:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
