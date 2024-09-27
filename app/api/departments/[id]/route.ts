import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/auth";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if the session exists and the user is logged in.
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user's role is either "SBTE_ADMIN" or "COLLEGE_SUPER_ADMIN".
    if (session.user.role !== "SBTE_ADMIN" && session.user.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params; // Get department ID from URL params
    const userCollegeId = session.user.collegeId; // Get the user's college ID
    const data = await request.json(); // Parse request body JSON

    // Check if the department with the given ID exists
    const department = await prisma.department.findUnique({
      where: { id },
    });

    // If department doesn't exist, return a 404 Not Found response
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // If the user is a College Super Admin, ensure they belong to the same college as the department
    if (session.user.role === "COLLEGE_SUPER_ADMIN" && department.collegeId !== userCollegeId) {
      return NextResponse.json(
        { error: "You do not have the permission to update this department" },
        { status: 403 }
      );
    }

    // Exclude fields like id, createdAt, updatedAt, and collegeId from being updated
    const { id: _, createdAt, updatedAt, collegeId, college, ...updateData } = data;

    // Perform the department update
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: updateData,
    });

    // Return the updated department object
    return NextResponse.json(updatedDepartment);
    
  } catch (error) {
    // Log the error and return a 500 Internal Server Error response
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session and check for authorization
    const session = await getServerSession(authOptions);

    // If the session or the user is not present, return an Unauthorized response
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the "SBTE_ADMIN" role; if not, return a Forbidden response
    if (session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract the department ID from the request parameters
    const { id } = params;

    // Find the department by its ID, and include associated HOD and the HOD's user details
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        headOfDepartment: {
          include: {
            user: true, // Include user details so the associated user can also be deleted
          },
        },
      },
    });

    // If no department is found with the given ID, return a Not Found response
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Start a transaction to ensure that all deletions (HOD, user, department) are done atomically
    await prisma.$transaction(async (prisma) => {
      // If the department has an associated Head of Department (HOD)
      if (department.headOfDepartment) {
        const hodId = department.headOfDepartment.id;       // Get the HOD's ID
        const hodUserId = department.headOfDepartment.userId; // Get the user ID associated with the HOD

        // Delete the HOD record from the database
        await prisma.headOfDepartment.delete({
          where: { id: hodId },
        });

        // Delete the user record associated with the HOD
        await prisma.user.delete({
          where: { id: hodUserId },
        });
      }

      // Finally, delete the department record from the database
      await prisma.department.delete({
        where: { id },
      });
    });

    // Return a success message if everything is deleted successfully
    return NextResponse.json({
      message: "Department, HOD, and associated user deleted successfully",
    });
  } catch (error) {
    // Catch and log any errors that occur during the process, and return an Internal Server Error response
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

