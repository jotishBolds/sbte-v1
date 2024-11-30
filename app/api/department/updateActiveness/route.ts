import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const { departmentId, isActive } = data;

    const session = await getServerSession(authOptions);
    if (session && session.user.role == "SBTE_ADMIN") {
      if (!departmentId || isActive === undefined) {
        return new NextResponse(
          JSON.stringify({
            message: "All fields (departmentId, and isActive) are required.",
          }),
          { status: 400 }
        );
      }
      const existingDepartment = await prisma.department.findUnique({
        where: {
          id: departmentId,
        },
      });
      if (!existingDepartment) {
        return new NextResponse("Department not found", { status: 404 });
      }
      const updatedDepartment = await prisma.department.update({
        where: {
          id: departmentId,
        },
        data: {
          isActive,
        },
      });
      return NextResponse.json(
        {
          message: "Department status updated successfully",
          department: updatedDepartment,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error updating department status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
