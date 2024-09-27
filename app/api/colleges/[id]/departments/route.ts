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
    // Retrieve the current session to check user authentication and authorization
    const session = await getServerSession(authOptions);

    // If the user is not authenticated or doesn't have the COLLEGE_SUPER_ADMIN role, return a 403 Forbidden response
    if (!session || !session.user || session.user.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Extract the college ID from the request parameters
    const { id } = params;

    // Check if a college with the given ID exists in the database
    const college = await prisma.college.findUnique({
      where: { id }, // Find the college by its unique ID
    });

    // If no college is found, return a 404 Not Found response
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Fetch all active departments for the college, including the head of department information
    const departments = await prisma.department.findMany({
      where: {
        collegeId: id,  // Match departments by the college ID
        isActive: true, // Only return departments that are active
      },
      include: { headOfDepartment: true }, // Include related head of department data
    });

    // If no departments are found, return a 404 response with a relevant message
    if (departments.length === 0) {
      return NextResponse.json(
        { error: "No departments found for this college" },
        { status: 404 }
      );
    }

    // Return the list of departments in a successful response
    return NextResponse.json(departments);
  } catch (error) {
    // Log any error that occurs for debugging purposes
    console.error("Error fetching college departments:", error);

    // Return a 500 Internal Server Error response if something goes wrong
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

