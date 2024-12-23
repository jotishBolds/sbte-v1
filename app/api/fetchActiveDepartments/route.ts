import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //   if (
    //     session.user?.role !== "COLLEGE_SUPER_ADMIN" &&
    //     session.user?.role !== "HOD" &&
    //     session.user?.role !== "STUDENT"
    //   ) {
    //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    //   }

    let collegeId;

    const url = new URL(request.url);
    collegeId = url.searchParams.get("collegeId");

    if (!collegeId) {
      collegeId = session.user.collegeId;
    }

    const departments = await prisma.department.findMany({
      where: {
        isActive: true,
        ...(collegeId ? { collegeId } : {}),
      },
    });

    if (!departments || departments.length === 0) {
      return NextResponse.json(
        { message: "No departments found" },
        { status: 404 }
      );
    }

    if (!departments || departments.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "No departments found" }),
        { status: 404 }
      );
    }

    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
