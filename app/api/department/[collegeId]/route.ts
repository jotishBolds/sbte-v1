import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";


export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { pathname } = request.nextUrl;
        const collegeId = pathname.split("/").pop();
        if (!collegeId) {
            return new NextResponse(JSON.stringify({ error: "College Id needs to be passed." }), { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (session && session.user.role == "SBTE_ADMIN") {
            const departments = await prisma.department.findMany({
                where: {
                    collegeId: collegeId,
                }
            });
            if (!departments || departments.length == 0) {
                return new NextResponse(JSON.stringify({ error: "No departments found for this college." }), { status: 404 });
            }
            return NextResponse.json(departments);
        }
        else if (session && session.user.role == "COLLEGE_SUPER_ADMIN") {
            const departments = await prisma.department.findMany({
                where: {
                    collegeId: collegeId,
                    isActive: true,
                }
            });
            if (!departments || departments.length == 0) {
                return new NextResponse(JSON.stringify({ error: "No departments found for this college." }), { status: 404 });
            }
            return NextResponse.json(departments);
        } else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

    } catch (error) {
        console.error("Error fetching departments:", error);
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });

    }
}