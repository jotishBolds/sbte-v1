import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COLLEGE_SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const college = await prisma.college.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        establishedOn: true,
        websiteUrl: true,
        contactEmail: true,
        contactPhone: true,
        IFSCCode: true,
        AccountNo: true,
        AccountHolderName: true,
        UPIID: true,
        departments: {
          where: { isActive: true },
          select: { id: true, name: true },
        },
        students: { select: { id: true } },
        financeManagers: { select: { id: true } },
      },
    });

    if (!college) {
      return NextResponse.json(
        { message: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(college);
  } catch (error) {
    console.error("Error fetching college:", error);
    return NextResponse.json(
      { message: "Error fetching college details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COLLEGE_SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();

  // Remove relation fields and metadata from the update data
  const {
    departments,
    students,
    financeManagers,
    programTypes,
    semesters,
    academicYears,
    admissionYears,
    batchYears,
    batchTypes,
    designations,
    categories,
    subjectTypes,
    certificateTypes,
    examTypes,
    subjects,
    createdAt,
    updatedAt,
    ...updateData
  } = body;

  try {
    const updatedCollege = await prisma.college.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        address: true,
        establishedOn: true,
        websiteUrl: true,
        contactEmail: true,
        contactPhone: true,
        IFSCCode: true,
        AccountNo: true,
        AccountHolderName: true,
        UPIID: true,
        departments: {
          where: { isActive: true },
          select: { id: true, name: true },
        },
        students: { select: { id: true } },
        financeManagers: { select: { id: true } },
      },
    });

    return NextResponse.json(updatedCollege);
  } catch (error) {
    console.error("Error updating college:", error);
    return NextResponse.json(
      { message: "Error updating college details" },
      { status: 500 }
    );
  }
}
