import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
export async function POST(request: NextRequest): Promise<NextResponse> {
    console.log(request)
    try {
        const data = await request.json();
        const { name, code, semester, creditScore, departmentId, teacherId} = data;

        // Check if all fields are provided
        if (!name || !code || !semester || creditScore === undefined || !departmentId ) {
            return new NextResponse(JSON.stringify({ message: "All fields are required" }), { status: 400 });
        }else{
            console.log("passed 1");
        }

        // Get the session of the current user
        const session = await getServerSession(authOptions);
        // Check if the user is logged in and is an HOD
        if (session && session.user.role === "HOD") {
            // Verify if the HOD belongs to the department they are trying to add the subject to
            console.log('entered as HOD',session.user);
            // const hod = await prisma.user.findUnique(id);
            const hod = await prisma.user.findUnique({
                where: { id: params.id },
                select: { id: true, username: true, email: true, role: true, departmentId: true },
              });
            console.log(hod);

            if (!hod || hod.departmentId !== departmentId) {
                return new NextResponse(JSON.stringify({ message: "Unauthorized to add subjects to this department" }), { status: 403 });
            }else{
                    console.log("user is HOD");
            }

            // Check if a subject with the same name and code already exists in the department
            const existingSubject = await prisma.subject.findFirst({
                where: {
                    name: name,
                    code: code,
                    departmentId: departmentId,
                },
            });

            if (existingSubject) {
                return new NextResponse("Subject with the same name and code already exists in this department", { status: 409 }); // 409 Conflict
            }

            // Create the new subject
            const newSubject = await prisma.subject.create({
                data: {
                    name,
                    code,
                    semester,
                    creditScore,
                    department: {
                        connect: { id: departmentId },
                    },
                    ...(teacherId && {
                        teacher: {
                            connect: { id: teacherId },
                        },
                    }),
                },
            });

            return NextResponse.json({ message: "Subject Created Successfully", subject: newSubject }, { status: 201 });
        } else {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }
    } catch (error) {
        console.error("Error Creating Subject:", error);
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


export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (session && session.user.role === "SBTE_ADMIN") {
            const departments = await prisma.department.findMany();
            return NextResponse.json(departments);
        } else {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }
    } catch (error) {
        console.error("Error fetching departments:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


