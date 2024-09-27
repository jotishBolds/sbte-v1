import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth";

const prisma = new PrismaClient();

interface DepartmentCreationData {
  name: string;
  collegeId: string;
  isActive: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Fetch the session to verify if the user is authenticated and authorized
    const session = await getServerSession(authOptions);


    // Check if the session exists and if the user is logged in.
    // If the session is invalid or the user is not authenticated, return a 401 Unauthorized error.
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user's role is "SBTE_ADMIN".
    // If the user does not have the required role, return a 403 Forbidden error.
    if (session.user.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


    // Parse the request body to get the department creation data
    const data: DepartmentCreationData = await request.json();

    // Validate if both 'name' and 'collegeId' fields are provided.
    // If not, return a 400 Bad Request error.
    if (!data.name || !data.collegeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if a department with the same name already exists for the specified college.
    // If it exists, return a 409 Conflict error to prevent duplicates.
    const existingDepartment = await prisma.department.findFirst({
      where: {
        name: data.name,
        collegeId: data.collegeId,
      },
    });

    // If a department with the same name exists, send a conflict response.
    if (existingDepartment) {
      return NextResponse.json(
        { error: `Department with the name "${data.name}" already exists for this college` },
        { status: 409 } // Conflict status code for an existing resource
      );
    }

    // Create a new department with the provided data.
    // 'connect' establishes the relationship between the department and the college via 'collegeId'.
    const newDepartment = await prisma.department.create({
      data: {
        name: data.name,
        isActive: data.isActive, // Optional: Handle whether the department is active
        college: {
          connect: {
            id: data.collegeId,
          },
        },
      },
    });

    // Return the created department with a 201 Created status
    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    // Log any errors encountered during execution and return a 500 Internal Server Error.
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    // Fetch the session to verify if the user is authenticated
    const session = await getServerSession(authOptions);

    // Check if the session exists and if the user is logged in.
    // If not, return a 401 Unauthorized error.
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow access for users with the roles "SBTE_ADMIN", "COLLEGE_SUPER_ADMIN", or "ADM".
    // If the user's role is not one of these, return a 403 Forbidden error.
    if (
      session.user.role !== "SBTE_ADMIN" &&
      session.user.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user.role !== "ADM"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let departments;

    // If the user is "SBTE_ADMIN", fetch all departments across all colleges
    if (session.user.role === "SBTE_ADMIN") {
      departments = await prisma.department.findMany({
        include: {
          college: {
            select: {
              name: true, // Only fetch the college name along with the department
            },
          },
        },
      });
    }
    // For "COLLEGE_SUPER_ADMIN" and "ADM", fetch only departments for the user's associated college
    else {
      // Check if the collegeId is available in the session. If not, return a 400 Bad Request error.
      if (!session.user.collegeId) {
        return NextResponse.json(
          { error: "College ID not found for user" },
          { status: 400 }
        );
      }

      // Fetch departments for the college associated with the user's collegeId
      departments = await prisma.department.findMany({
        where: {
          collegeId: session.user.collegeId, // Filter by user's collegeId
        },
        include: {
          college: {
            select: {
              name: true, // Include college name in the result
            },
          },
        },
      });
    }

    // If no departments are found, return a 404 Not Found error with a relevant message.
    if (departments.length === 0) {
      return NextResponse.json(
        { error: "No departments found for this college" },
        { status: 404 }
      );
    }

    // Return the fetched departments as a JSON response
    return NextResponse.json(departments);
  } catch (error) {
    // Log any errors encountered during execution and return a 500 Internal Server Error response.
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

