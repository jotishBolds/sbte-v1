import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Step 1: Fetch the user session using getServerSession. This checks if the user is logged in.
    const session = await getServerSession(authOptions);

    // Step 2: Verify if the user is authenticated and is a COLLEGE_SUPER_ADMIN.
    if (
      !session ||
      !session.user ||
      session.user.role !== "COLLEGE_SUPER_ADMIN"
    ) {
      // Return a 401 Unauthorized response if the user is not authenticated or is not a COLLEGE_SUPER_ADMIN.
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Step 3: Extract the collegeId from the session. The user should be associated with a college.
    const collegeId = session.user.collegeId;
    if (!collegeId) {
      // If the collegeId is not found in the session, return a 400 Bad Request response.
      return NextResponse.json(
        { message: "College ID not found" },
        { status: 400 }
      );
    }

    // Step 4: Parse the search parameters from the request URL to check for departmentId.
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");

    // Step 5: If departmentId is provided, check if the department exists in the database.
    if (departmentId) {
      const departmentExists = await prisma.department.findUnique({
        where: {
          id: departmentId,
        },
      });

      // If the department does not exist, return a 404 Not Found response.
      if (!departmentExists) {
        return NextResponse.json({ message: "No such department found" }, { status: 404 });
      }
    }

    // Step 6: Query the database for alumni who belong to the same college and optionally filter by departmentId.
    const alumni = await prisma.alumnus.findMany({
      where: {
        department: {
          collegeId: collegeId,  // Filter by collegeId
        },
        ...(departmentId && { departmentId }),  // If departmentId is provided, filter by it as well
      },
      include: {
        user: {
          select: {
            email: true,  // Include only the email from the user relation
          },
        },
        department: {
          select: {
            name: true,  // Include only the name of the department
          },
        },
      },
    });

    // Step 7: If no alumni are found, return a 404 Not Found response.
    if (alumni.length == 0) {
      return NextResponse.json(
        { message: "No alumni found" },
        { status: 404 }
      );
    }

    // Step 8: Format the alumni data before sending the response.
    const formattedAlumni = alumni.map((alumnus) => ({
      id: alumnus.id,  // Alumnus ID
      name: alumnus.name,  // Alumnus name
      email: alumnus.user.email,  // Associated user's email
      department: alumnus.department.name,  // Alumnus department name
      graduationYear: alumnus.graduationYear,  // Graduation year of alumnus
      verified: alumnus.verified,  // Alumnus verified status
    }));

    // Step 9: Return the formatted alumni data as a JSON response.
    return NextResponse.json(formattedAlumni);
  } catch (error) {
    // Step 10: Catch and log any errors, and return a 500 Internal Server Error response.
    console.error("Error fetching alumni:", error);
    return NextResponse.json(
      { message: "Error fetching alumni" },
      { status: 500 }
    );
  }
}

