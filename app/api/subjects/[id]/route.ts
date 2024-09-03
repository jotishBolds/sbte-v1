import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"


export async function PUT(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const subjectId = params.id;
        const data = await request.json();
        let { name, code, semester, creditScore, teacherId } = data;

        if (!subjectId) {
            return new NextResponse(JSON.stringify({ message: "Subject ID is required" }), { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        if (session.user.role !== "HOD") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized: Only HOD can update subjects" }), { status: 403 });
        }

        const existingSubject = await prisma.subject.findUnique({
            where: {
                id: subjectId,
            },
            include: {
                department: true,
            },
        });

        if (!existingSubject) {
            return new NextResponse(JSON.stringify({ message: "Subject not found" }), { status: 404 });
        }

        if (existingSubject && session.user.departmentId !== existingSubject.departmentId) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized: You are not authorized to update subjects in this department" }), { status: 403 });
        }

        if (teacherId) {
            const existingTeacher = await prisma.teacher.findUnique({
                where: {
                    id: teacherId,

                },
                include: {
                    user: {
                        include: {
                            college: true, // Include the department to get the collegeId
                        },
                    },
                },
            });
            if (!existingTeacher) {
                return new NextResponse(JSON.stringify({ message: "Teacher not found" }), { status: 404 });
            }
            if (existingTeacher.user.collegeId !== existingSubject.department.collegeId) {
                return new NextResponse(
                    JSON.stringify({ message: "Unauthorized: Teacher does not belong to the same college as the subject" }),
                    { status: 403 }
                );
            }
        }   

        creditScore = creditScore !== undefined ? parseFloat(creditScore) : undefined;
        if (creditScore !== undefined && isNaN(creditScore)) {
            return new NextResponse(JSON.stringify({ message: "Invalid credit score value" }), { status: 400 });
        }

        const updateData: any = {
            name,
            code,
            semester,
            creditScore
        };

        if (teacherId && teacherId.trim() !== "") {
            updateData.teacherId = teacherId; // Only add teacherId if it's not empty
        }
        if (teacherId == null) {
            updateData.teacherId = teacherId; // Add teacherId to null if specified null
        }

        const updatedSubject = await prisma.subject.update({
            where: {
                id: subjectId,
            },
            data: updateData,
        });

        return NextResponse.json({ message: "Subject Updated Successfully", subject: updatedSubject }, { status: 200 });

    } catch (error) {
        console.error("Error Updating Subject:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const subjectId = params.id;

        // Fetch the session to validate the user
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        // Ensure that the user is an HOD
        if (session.user.role !== "HOD") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized: Only HODs can delete subjects" }), { status: 403 });
        }

        // Fetch the subject to check department and existence
        const subject = await prisma.subject.findUnique({
            where: {
                id: subjectId,
            },
            include: {
                department: true,
            },
        });

        if (!subject) {
            return new NextResponse(JSON.stringify({ message: "Subject not found" }), { status: 404 });
        }

        // Ensure that the subject belongs to the HOD's department
        if (subject.departmentId !== session.user.departmentId) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized: You can only delete subjects from your department" }), { status: 403 });
        }

        // Perform the deletion
        await prisma.subject.delete({
            where: {
                id: subjectId,
            },
        });

        return new NextResponse(JSON.stringify({ message: "Subject deleted successfully" }), { status: 200 });

    } catch (error) {
        console.error("Error deleting subject:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}