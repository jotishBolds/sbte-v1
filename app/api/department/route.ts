import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        const { name, isActive, collegeId } = data;

        if (!name || !isActive || !collegeId) {
            return new NextResponse(JSON.stringify({ message: "All fields are required" }), { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (session && session.user.role == "SBTE_ADMIN") {
            const existingDepartment = await prisma.department.findFirst({
                where: {
                    name: name,
                    collegeId: collegeId,
                },
            });
            if (existingDepartment) {
                console.error("Department already exists for this college");
                return new NextResponse("Department already exists for this college", { status: 409 }); // 409 Conflict
            }

            const newDepartment = await prisma.department.create(
                {
                    data: {
                        name,
                        isActive,
                        college: {
                            connect: { id: collegeId },
                        },
                    }
                }
            );
            return NextResponse.json({ message: "Department Created Successfully", department: newDepartment }, { status: 201 });
        } else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    } catch (error) {
        console.error("Error Creating Department:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        const { departmentId, name, isActive, collegeId } = data;

        if (!departmentId || !name || isActive === undefined || !collegeId) {
            return new NextResponse(JSON.stringify({ message: "All fields (creator_id, departmentId, name, isActive, and collegeId) are required." }), { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (session && session.user.role == "SBTE_ADMIN") {
            const existingDepartment = await prisma.department.findUnique({
                where: {
                    id: departmentId,
                },
            });

            if (!existingDepartment) {
                return new NextResponse("Department not found", { status: 404 });
            }

            const updatedDepartment = await prisma.department.update({
                where: {
                    id: departmentId,
                },
                data: {
                    name,
                    isActive,
                    collegeId,
                },
            });

            return NextResponse.json({ message: "Department updated successfully", department: updatedDepartment }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    } catch (error) {
        console.error("Error updating department:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        // Extract the payload from the request body
        const data = await request.json();
        const { departmentId } = data;

        if (!departmentId) {
            return new NextResponse(JSON.stringify({ message: "Department ID is required" }), { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (session && session.user.role === "SBTE_ADMIN") {
            const existingDepartment = await prisma.department.findUnique({
                where: {
                    id: departmentId,
                },
            });

            if (!existingDepartment) {
                return new NextResponse("Department not found", { status: 404 });
            }

            await prisma.department.delete({
                where: {
                    id: departmentId,
                },
            });

            return NextResponse.json({ message: "Department deleted successfully" }, { status: 200 });
        } else {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }
    } catch (error) {
        console.error("Error deleting department:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
      // Fetch the session to validate the user
      const session = await getServerSession(authOptions);
      if (!session) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
      }
  
      // Determine the query based on the user role
      const whereClause: any = {};
  
      if (session.user.role !== "SBTE_ADMIN") {
        // Add isActive condition for non-SBTE_ADMIN roles
        whereClause.isActive = true;
      }
  
      // Fetch all departments with the conditional `isActive` filter
      const departments = await prisma.department.findMany({
        where: whereClause,
        include: {
          college: {
            select: {
              name: true
            }
          }
        }
      });
  
      // Check if any departments were found
      if (!departments || departments.length === 0) {
        return new NextResponse(JSON.stringify({ message: "No departments found" }), { status: 404 });
      }
  
      // Return the fetched data (list of departments)
      return NextResponse.json(departments, { status: 200 });
  
    } catch (error) {
      console.error("Error fetching departments:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }


