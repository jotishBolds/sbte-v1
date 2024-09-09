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

    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");

    const alumni = await prisma.alumnus.findMany({
      where: {
        department: {
          collegeId: collegeId,
        },
        ...(departmentId && { departmentId }),
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedAlumni = alumni.map((alumnus) => ({
      id: alumnus.id,
      name: alumnus.name,
      email: alumnus.user.email,
      department: alumnus.department.name,
      graduationYear: alumnus.graduationYear,
      verified: alumnus.verified,
    }));

    console.log("Alumni fetched:", formattedAlumni);
    return NextResponse.json(formattedAlumni);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return NextResponse.json(
      { message: "Error fetching alumni" },
      { status: 500 }
    );
  }
}
