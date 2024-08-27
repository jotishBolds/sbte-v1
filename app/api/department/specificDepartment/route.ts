import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        const { departmentId, name, isActive, collegeId } = data;

        if (!departmentId || !name || isActive === undefined || !collegeId) {
            return new NextResponse(JSON.stringify({ message: "All fields (departmentId, name, isActive, and collegeId) are required." }), { status: 400 });
        }

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
    } catch (error) {
        console.error("Error updating department:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
