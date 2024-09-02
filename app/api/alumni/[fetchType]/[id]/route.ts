import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma/client";

export async function GET(
    request: NextRequest,
    { params }: { params: { fetchType: string; id: string } }
): Promise<NextResponse> {
    try {
        const { fetchType, id } = params;

        if (!id) {
            return new NextResponse(JSON.stringify({ message: "ID is required" }), { status: 400 });
        }

        const allowedFetchTypes = ['college', 'department', 'alumni'];
        if (!allowedFetchTypes.includes(fetchType)) {
            return new NextResponse(JSON.stringify({ message: "Invalid fetch type" }), { status: 400 });
        }

        let alumni;

        switch (fetchType) {
            case 'college':
                alumni = await prisma.alumnus.findMany({
                    where: {
                        department: {
                            collegeId: id,
                        }
                    },
                    include: {
                        user: true,
                        department: true,
                    },
                });
                if (alumni.length === 0) {
                    return new NextResponse(JSON.stringify({ message: "No alumni found for this college" }), { status: 404 });
                }
                break;

            case 'department':
                alumni = await prisma.alumnus.findMany({
                    where: {
                        departmentId: id
                    },
                    include: {
                        user: true,
                        department: true,
                    },
                });
                if (alumni.length === 0) {
                    return new NextResponse(JSON.stringify({ message: "No alumni found for this department" }), { status: 404 });
                }
                break;

            case 'alumni':
                alumni = await prisma.alumnus.findUnique({
                    where: { id },
                    include: {
                        user: true,
                        department: true,
                    },
                });
                if (!alumni) {
                    return new NextResponse(JSON.stringify({ message: "No alumni found with this ID" }), { status: 404 });
                }
                break;
        }

        return NextResponse.json({ alumni }, { status: 200 });
    } catch (error) {
        console.error("Error fetching alumni:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const { id } = params;
        if (!id) {
            return new NextResponse(JSON.stringify({ message: "ID is required" }), { status: 400 });
        }
        const body = await request.json();
        if (typeof body.verified !== 'boolean') {
            return new NextResponse(JSON.stringify({ message: "The 'verified' field must be a boolean" }), { status: 400 });
        }
        const alumnus = await prisma.alumnus.update({
            where: { id },
            data: { verified: body.verified },
        });
        return NextResponse.json({ message: "Alumnus verification status updated successfully", alumnus }, { status: 200 });
    } catch (error) {
        console.error("Error updating alumni verification status:", (error as Error).message);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}



