import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        const {name, isActive, collegeId } = data;

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
        }else {
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
        const {departmentId, name, isActive, collegeId } = data;

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
        }else {
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


// export async function GET(): Promise<NextResponse> {
//     try {
//         const departments = await prisma.department.findMany();
//         return NextResponse.json(departments);
//     } catch (error) {
//         console.error("Error fetching departments:", error);
//         return new NextResponse("Internal Server Error", { status: 500 });
//     }
// }


