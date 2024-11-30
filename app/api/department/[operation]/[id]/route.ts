import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { operation: string; id: string } }
): Promise<NextResponse> {
  try {
    const { operation, id } = params;

    // Fetch the session to validate the user
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
      });
    }

    let data;

    // Determine the query based on the operation and user role
    if (operation === "department") {
      // Fetch department by departmentId
      data = await prisma.department.findUnique({
        where: {
          id, // Treat the `id` as `departmentId`
        },
        include: {
          college: {
            select: {
              name: true,
            },
          },
        },
      });

      // Check if the department exists and if `isActive` is true for non-SBTE_ADMIN roles
      if (!data) {
        return new NextResponse(
          JSON.stringify({ message: "Department not found" }),
          { status: 404 }
        );
      }

      if (session.user.role !== "SBTE_ADMIN" && !data.isActive) {
        return new NextResponse(
          JSON.stringify({ message: "Department is not active" }),
          { status: 404 }
        );
      }
    } else if (operation === "college") {
      // Fetch all departments by collegeId
      const whereClause: any = {
        collegeId: id, // Treat the `id` as `collegeId`
      };

      // Add isActive condition for non-SBTE_ADMIN roles
      if (session.user.role !== "SBTE_ADMIN") {
        whereClause.isActive = true;
      }

      data = await prisma.department.findMany({
        where: whereClause,
        include: {
          college: {
            select: {
              name: true,
            },
          },
        },
      });

      // Check if any departments were found
      if (!data || data.length === 0) {
        return new NextResponse(
          JSON.stringify({ message: "No departments found for this college" }),
          { status: 404 }
        );
      }
    } else {
      return new NextResponse(
        JSON.stringify({ message: "Invalid operation" }),
        { status: 400 }
      );
    }

    // Return the fetched data (department or list of departments)
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
