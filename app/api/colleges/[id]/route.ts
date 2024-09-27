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
    // Fetch the session to validate the user
    const session = await getServerSession(authOptions);

    // Ensure only SBTE_ADMIN can perform this operation
    if (!session || session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    // Check if the college with the given id exists
    const college = await prisma.college.findUnique({
      where: { id },
    });

    // If the college doesn't exist, return a 404 Not Found response
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Perform the transaction to delete the college and associated super admin
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
    // Fetch the session to validate the user
    const session = await getServerSession(authOptions);

    // Ensure only users with the SBTE_ADMIN role can perform this update operation
    if (!session || session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Extract the college ID from the URL parameters
    const { id } = params;

    // Parse the incoming request body to get the update data
    const data = await request.json();

    // Check if the college with the given ID exists in the database
    const college = await prisma.college.findUnique({
      where: { id },
    });

    // If the college doesn't exist, return a 404 Not Found response
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Update the college in the database with the new data
    const updatedCollege = await prisma.college.update({
      where: { id },  // Specify which college to update based on the ID
      data,           // Provide the new data for the update
    });

    // Return the updated college data as a JSON response
    return NextResponse.json(updatedCollege);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error updating college:", error);

    // Return a 500 Internal Server Error response if something goes wrong
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

