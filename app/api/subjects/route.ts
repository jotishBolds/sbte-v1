import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        let { name, code, semester, creditScore, departmentId, teacherId } = data;

        if (!name || !code || !semester || creditScore === undefined || !departmentId) {
            return new NextResponse(JSON.stringify({ message: "All fields are required" }), { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        if (session.user.role !== "HOD") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized: Only HOD can create subjects" }), { status: 403 });
        }

        if (session.user.departmentId !== departmentId) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized: You are not authorized to create subjects in this department" }), { status: 403 });
        }
        if(teacherId){
            const existingTeacher = await prisma.teacher.findUnique({
                where: {
                    id: teacherId,
                },
            });
            if (!existingTeacher) {
                return new NextResponse(JSON.stringify({ message: "Teacher not found" }), { status: 404 });
            }
        }
       
        creditScore = parseFloat(creditScore);  //conversion as it was giving error saying string not allowed
        if (isNaN(creditScore)) {
            return new NextResponse(JSON.stringify({ message: "Invalid credit score value" }), { status: 400 });
        }

        const existingSubject = await prisma.subject.findFirst({
            where: {
                name,
                code,
                departmentId,
            },
        });

        if (existingSubject) {
            return new NextResponse("Subject with the same name and code already exists in this department", { status: 409 }); // 409 Conflict
        }
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

    } catch (error) {
        console.error("Error Creating Subject:", error);
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


