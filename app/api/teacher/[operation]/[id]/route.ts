import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"

export async function GET(
    request: NextRequest, 
    { params }: { params: { operation: string; id: string } }
  ): Promise<NextResponse> {
    try {
      const { operation, id } = params;
  
      // Fetch the session to validate the user 
      const session = await getServerSession(authOptions);
      if (!session) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
      }
  
      let data;
  
      // Determine whether to fetch by teacherId or collegeId based on the operation
      if (operation === "teacher") {
        // Fetch teacher by teacherId
        data = await prisma.teacher.findUnique({
          where: {
            id, // Treat the `id` as `teacherId`
          },
          include: {
            user: {
              include: {
                college: true,
                department: true,
              },
            },
          },
        });
  
        // Check if the teacher exists
        if (!data) {
          return new NextResponse(JSON.stringify({ message: "Teacher not found" }), { status: 404 });
        }
  
      } else if (operation === "college") {
        // Fetch all teachers by collegeId
        data = await prisma.teacher.findMany({
          where: {
            user: {
              collegeId: id, // Treat the `id` as `collegeId`
            },
          },
          include: {
            user: {
              include: {
                college: true,
                department: true,
              },
            },
          },
        });
  
        // Check if any teachers were found
        if (!data || data.length === 0) {
          return new NextResponse(JSON.stringify({ message: "No teachers found for this college" }), { status: 404 });
        }
  
      } else {
        return new NextResponse(JSON.stringify({ message: "Invalid operation" }), { status: 400 });
      }
  
      // Return the fetched data (teacher or list of teachers)
      return NextResponse.json(data, { status: 200 });
  
    } catch (error) {
      console.error("Error fetching data:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }