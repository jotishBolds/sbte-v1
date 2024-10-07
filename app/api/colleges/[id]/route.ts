// app/api/colleges/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure only SBTE_ADMIN can perform this operation
    if (!session || session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    // Perform the transaction
    await prisma.$transaction(async (prisma) => {
      // Delete the COLLEGE_SUPER_ADMIN associated with the college
      await prisma.user.deleteMany({
        where: {
          collegeId: id,
          role: "COLLEGE_SUPER_ADMIN",
        },
      });

      // Delete the college
      await prisma.college.delete({
        where: { id },
      });
    });

    // Success response
    return NextResponse.json({ message: "College and associated super admin deleted successfully" });

  } catch (error) {
    console.error("Error deleting college and super admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();

    const updatedCollege = await prisma.college.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedCollege);
  } catch (error) {
    console.error("Error updating college:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
