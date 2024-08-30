import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { semester: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
    }

    const { semester } = params;
    const departmentId = session.user.departmentId;

    if (session.user.role !== "HOD" && session.user.role !== "ADM") {
        return new NextResponse(JSON.stringify({ message: "Unauthorized: Only HOD & ADM can fetch subjects" }), { status: 403 });
    }
    
    // Fetch subjects for the specified semester
    const subjects = await prisma.subject.findMany({
      where: {
        semester,
        departmentId, // Filter by the department associated with the user's session
      },
      include: {
        teacher: true, // Optional: include related teacher data
        department: true, // Optional: include related department data
      },
    });

    if (subjects.length === 0) {
      return new NextResponse(JSON.stringify({ message: "No subjects found for this semester." }), { status: 404 });
    }

    return new NextResponse(JSON.stringify(subjects), { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
