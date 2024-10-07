// /api/alumni/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

import { z } from "zod";
import prisma from "@/src/lib/prisma";

const alumniUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phoneNo: z.string().min(10).max(15).optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().min(5).max(255).optional(),
  departmentId: z.string().optional(),
  batchYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  graduationYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 5)
    .optional(),
  gpa: z.number().min(0).max(4).optional(),
  jobStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentPosition: z.string().optional(),
  industry: z.string().optional(),
  // linkedInProfile: z.string().url().optional(),
  linkedInProfile: z.union([z.string().url(), z.literal("")]).optional(), // Allow empty string or valid URL
  achievements: z.string().optional(),
  verified: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Destructure to get the id parameter from the request
) {
  try {
    // Retrieve the user session from the server
    const session = await getServerSession(authOptions);

    // Check if the session exists and the user is authenticated
    // Also, check if the user role is either COLLEGE_SUPER_ADMIN or ALUMNUS
    if (
      !session ||
      !session.user ||
      (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ALUMNUS")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the alumnus details from the database using the provided ID
    const alumnus = await prisma.alumnus.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true, // Include the email of the user
          },
        },
        department: {
          select: {
            name: true, // Include the name of the department
            collegeId: true, // Include the college ID associated with the department
          },
        },
      },
    });

    // Check if the alumnus was found
    if (!alumnus) {
      return NextResponse.json(
        { error: "Alumnus not found" },
        { status: 404 } // Return 404 if not found
      );
    }

    // If the user is an alumnus, check if they are requesting their own details
    if (session.user.role == "ALUMNUS") {
      const loggedInUserId = session.user.id;
      // Compare logged-in user's ID with the requested alumnus ID
      if (loggedInUserId != alumnus.userId) {
        return NextResponse.json({ error: "You do not have permission to access this alumnus detail." }, { status: 403 });
      }
    }

    // If the user is a COLLEGE_SUPER_ADMIN, check their permission to access the alumnus details
    if (session.user.role == "COLLEGE_SUPER_ADMIN") {
      // Compare the college ID of the department to the college ID of the user
      if (alumnus.department.collegeId !== session.user.collegeId) {
        return NextResponse.json(
          { error: "You do not have permission to access this alumnus detail." },
          { status: 403 } // Return 403 if access is denied
        );
      }
    }

    // Return the alumnus details as the response
    return NextResponse.json(alumnus);
  } catch (error) {
    // Handle any errors during the fetching process
    console.error("Error fetching alumnus:", error);
    return NextResponse.json(
      { message: "Error fetching alumnus" },
      { status: 500 } // Return 500 if there is a server error
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Step 1: Verify if the user is authenticated and is either a College Admin or Alumnus
    if (
      !session ||
      !session.user || 
      (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ALUMNUS")
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Parse the request body and validate the data
    const body = await request.json();
    const validatedData = alumniUpdateSchema.parse(body);

    // Step 3: Fetch the Alumnus record using the id passed in the parameters
    const alumnus = await prisma.alumnus.findUnique({
      where: { id: params.id },
      include: {
        department: {
          select: {
            collegeId: true, // To check the college association
          },
        },
      },
    });

    if (!alumnus) {
      return NextResponse.json({ message: "Alumnus not found" }, { status: 404 });
    }

    // Step 4: If the user is an Alumnus, ensure they are updating their own profile
    if (session.user.role === "ALUMNUS") {
      // Ensure the alumnus can only modify their own profile
      if (alumnus.userId !== session.user.id) {
        return NextResponse.json(
          { message: "Unauthorized to update another alumnus's profile" },
          { status: 401 }
        );
      }

      // Prevent alumnus from updating the `verified` attribute
      if ('verified' in validatedData) {
        return NextResponse.json(
          { message: "Alumni cannot modify the verified status" },
          { status: 403 }
        );
      }
    }

    // Step 5: If the user is a College Admin, ensure the alumnus belongs to the same college
    if (session.user.role === "COLLEGE_SUPER_ADMIN") {
      const collegeId = session.user.collegeId;

      // Ensure the college admin and alumnus belong to the same college
      if (alumnus.department.collegeId !== collegeId) {
        return NextResponse.json(
          { message: "You do not have permission to update this alumnus's details" },
          { status: 403 }
        );
      }
    }

    // Step 6: Update the Alumnus record
    const updatedAlumnus = await prisma.alumnus.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Step 7: Return the updated Alumnus data
    return NextResponse.json(updatedAlumnus);
  } catch (error) {
    // Step 8: Error handling
    console.error("Error updating alumnus:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error updating alumnus" },
      { status: 500 }
    );
  }
}



export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Step 1: Retrieve the session to check user authentication
    const session = await getServerSession(authOptions);

    // Step 2: Verify if the user is authenticated, has the required user object and is a college super admin
    if (
      !session ||
      !session.user
      // || session.user.role !== "COLLEGE_SUPER_ADMIN"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Step 3: Extract collegeId from the session
    const collegeId = session.user.collegeId;

    // Step 4: Check if collegeId exists in the session
    if (!collegeId) {
      return NextResponse.json(
        { message: "College Id not found" },
        { status: 404 }
      )
    }

    // Step 5: Look for the Alumnus record by the given ID
    const existingAlumnus = await prisma.alumnus.findUnique({
      where: { id: params.id },
      include: {
        department: true, // Include the department to access collegeId
      },
    })

    // Step 6: Check if the Alumnus exists
    if (!existingAlumnus) {
      return NextResponse.json(
        { message: "Alumnus not found" },
        { status: 404 }
      )
    }

    // Step 7: Ensure that the Alumnus belongs to the same college as the College Admin
    if (existingAlumnus.department.collegeId !== collegeId) {
      return NextResponse.json(
        { error: "You do not have permission to delete this alumnus." },
        { status: 403 }
      );
    }
    // Step 7.5: Ensure that the id of the user associated with the alumnus exists
    const toBeDeletedUserId = existingAlumnus.userId;

    // Step 8: Proceed to delete the Alumnus record after the user is deleted
    await prisma.alumnus.delete({
      where: { id: params.id },
    });

    // Step 9: Delete the user associated with the alumnus from the User table first
    await prisma.user.delete({
      where: { id: existingAlumnus.userId }, // Delete the user by userId
    });

    // Step 10: Return a success message after deletion
    return NextResponse.json({ message: "Alumnus deleted successfully" });
  } catch (error) {

    // Step 11: Handle any errors that occur during the process\
    console.error("Error deleting alumnus:", error);
    return NextResponse.json(
      { message: "Error deleting alumnus" },
      { status: 500 }
    );
  } finally {
    // Step 12: Ensure that Prisma client is disconnected after the operation
    await prisma.$disconnect();
  }
}
