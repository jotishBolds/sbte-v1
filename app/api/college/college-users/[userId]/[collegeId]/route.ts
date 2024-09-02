import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Extract the userId and collegeId from the URL path
        const { pathname } = request.nextUrl;
        const pathSegments = pathname.split('/').filter(Boolean); // Split the path and remove empty segments
        const userId = pathSegments[pathSegments.length - 2]; // Second last segment is userId
        const collegeId = pathSegments[pathSegments.length - 1]; // Last segment is collegeId

        // Validate if userId and collegeId are provided
        if (!userId || !collegeId) {
            return new NextResponse(JSON.stringify({ message: "User Id and College Id need to be passed." }), { status: 400 });
        }

        // Fetch the session
        const session = await getServerSession(authOptions);

        // If the user is SBTE_ADMIN, fetch users for the provided collegeId
        if (session && session.user.role === "SBTE_ADMIN") {
            const collegeUsers = await prisma.user.findMany({
                where: {    
                    collegeId: collegeId,
                },
            });

            return NextResponse.json(collegeUsers, { status: 200 });

            // If the user is COLLEGE_SUPER_ADMIN, ensure they can only fetch users from their own college
        } else if (session && session.user.role === "COLLEGE_SUPER_ADMIN") {
            const collegeSuperAdmin = await prisma.user.findUnique({
                where: { id: userId },
                include: { college: true },
            });

            if (!collegeSuperAdmin) {
                return new NextResponse(JSON.stringify({ message: "User not found." }), { status: 404 });
            }

            if (collegeSuperAdmin.collegeId !== collegeId) {
                return new NextResponse(JSON.stringify({ message: "Unauthorized to access users for this college." }), { status: 403 });
            }

            const collegeUsers = await prisma.user.findMany({
                where: {
                    collegeId: collegeSuperAdmin.collegeId,
                    NOT: {
                        role: "COLLEGE_SUPER_ADMIN",
                    },
                },
            });

            return NextResponse.json(collegeUsers, { status: 200 });
        } else {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}


