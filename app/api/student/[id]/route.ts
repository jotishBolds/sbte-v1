import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET(request: NextRequest,{ params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const studentUserId = params.id;
    // Fetch the session to validate the user
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
    }

    // Get the user's collegeId from the session
    // const userCollegeId = session.user.collegeId;

    // if (!userCollegeId) {
    //   return new NextResponse(JSON.stringify({ message: "User does not belong to any college" }), { status: 400 });
    // }

    // Fetch all students whose collegeId matches the session user’s collegeId
    const students = await prisma.student.findMany({
      where: { userId: studentUserId },
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    // Check if any students were found
    if (!students || students.length === 0) {
      return new NextResponse(JSON.stringify({ message: "No students found with this user Id "}), { status: 404 });
    }

    // Return the fetched student data
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
