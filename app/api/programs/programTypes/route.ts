import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

// Initialize Prisma Client to interact with the database
const prisma = new PrismaClient();

interface ProgramTypeCreationData {
  name: string;
  collegeId: string;
}

// POST request to create a new ProgramType
export async function POST(request: NextRequest) {
  try {
    // Retrieve user session
    const session = await getServerSession(authOptions);

    // Check if the user is logged in
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 
    // Check if the user has the appropriate role to create a ProgramType
    else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse the request data
    const data: ProgramTypeCreationData = await request.json();
    const collegeId = session.user.collegeId;

    // Validate required fields (name and collegeId)
    if (!data.name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!collegeId) {
      return NextResponse.json(
        { error: "No College associated with the user." },
        { status: 404 }
      );
    }

    // Validate that the name is not longer than 100 characters
    if (data.name.length > 100) {
      return NextResponse.json(
        { error: "Name must be smaller than 100 characters long." },
        { status: 400 }
      );
    }

    // Validate that the name is alphanumeric (cannot be purely numeric)
    const alphanumericRegex = /^(?![0-9]+$)[a-zA-Z0-9\s]+$/;
    if (!alphanumericRegex.test(data.name)) {
      return NextResponse.json(
        { error: "Name must be alphanumeric and cannot be purely numeric." },
        { status: 400 }
      );
    }

    // Check if a ProgramType with the same name already exists in the same college
    const existingProgramType = await prisma.programType.findFirst({
      where: {
        name: data.name,
        collegeId: collegeId,
      },
    });

    // If a ProgramType with the same name exists, return a conflict error
    if (existingProgramType) {
      return NextResponse.json(
        { error: `Program type with name ${data.name} already exists in this college.` },
        { status: 409 } // Conflict
      );
    }

    // Create a new ProgramType in the database
    const newProgramType = await prisma.programType.create({
      data: {
        name: data.name,
        college: {
          connect: {
            id: data.collegeId,
          },
        },
      },
    });

    // Return the newly created ProgramType
    return NextResponse.json(newProgramType, { status: 201 });
  } catch (error) {
    console.error("Error creating program type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET request to retrieve all ProgramTypes for the current user's college
export async function GET(request: NextRequest) {
  try {
    // Retrieve user session
    const session = await getServerSession(authOptions);

    // Check if the user is logged in
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 
    // Only users with the role COLLEGE_SUPER_ADMIN are allowed to fetch ProgramTypes
    else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the collegeId from the user's session
    const collegeId = session.user.collegeId;

    // Check if the user is associated with a college
    if (!collegeId) {
      return NextResponse.json(
        { error: "No college associated with the user." },
        { status: 404 }
      );
    }

    // Fetch all ProgramTypes for the current user's college
    const programTypes = await prisma.programType.findMany({
      where: { collegeId },
      include: {
        college: {
          select: {
            name: true, // Select the college name for each ProgramType
          },
        },
      },
    });

    // If no ProgramTypes are found, return a 404 status
    if (programTypes.length <= 0) {
      return NextResponse.json(
        { message: "No program types found for this college." },
        { status: 404 } // Not Found status
      );
    }

    // Return the list of ProgramTypes
    return NextResponse.json(programTypes, { status: 200 });
  } catch (error) {
    console.error("Error fetching program types:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
