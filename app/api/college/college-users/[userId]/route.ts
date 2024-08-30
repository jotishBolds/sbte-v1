import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        const { pathname } = request.nextUrl;
        const pathSegments = pathname.split('/').filter(Boolean);
        const userIdToDelete = pathSegments[pathSegments.length - 1];

        if (!userIdToDelete) {
            return new NextResponse(JSON.stringify({ message: "User Id needs to be passed." }), { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        if ((session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM") || !session.user.collegeId) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized User Type" }), { status: 403 });
        }

        const userToDelete = await prisma.user.findUnique({ 
            where: { id: userIdToDelete },
        });

        if (!userToDelete) {
            return new NextResponse(JSON.stringify({ message: "User not found." }), { status: 404 });
        }

        if (userToDelete.collegeId !== session.user.collegeId) {
            return new NextResponse(JSON.stringify({ message: "You can only delete users from your own college." }), { status: 403 });
        }

        await prisma.user.delete({
            where: { id: userIdToDelete },
        });

        return new NextResponse(JSON.stringify({ message: "User deleted successfully." }), { status: 200 });

    } catch (error) {
        console.error("Error deleting user:", error);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
    try {
        const { pathname } = request.nextUrl;
        const pathSegments = pathname.split('/').filter(Boolean);
        const userIdToUpdate = pathSegments[pathSegments.length - 1];

        if (!userIdToUpdate) {  
            return new NextResponse(JSON.stringify({ message: "User Id needs to be passed." }), { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        if ((session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM") || !session.user.collegeId) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized User Type" }), { status: 403 });
        }

        const data = await request.json();

        const userToUpdate = await prisma.user.findUnique({
            where: { id: userIdToUpdate },
        });

        if (!userToUpdate) {
            return new NextResponse(JSON.stringify({ message: "User not found." }), { status: 404 });
        }

        if (userToUpdate.collegeId !== session.user.collegeId) {
            return new NextResponse(JSON.stringify({ message: "You can only update users from your own college." }), { status: 403 });
        }

         const {
            id: _,
            createdAt,
            // updatedAt,
            collegeId,
            college,
            password,
            ...updateData
        } = data;



        const allowedFields = ["email", "role", "departmentId", "username"];
        const filteredData = Object.fromEntries(
            Object.entries(updateData)
            .filter(([key, value]) => {
                return allowedFields.includes(key) && (key !== "departmentId" || (key == "departmentId" && value !== "" ));
            })
            .map(([key, value]) => {
                return [key, value];
            })
        );

        if (Object.keys(filteredData).length === 0) {
            return new NextResponse(JSON.stringify({ message: "No valid fields provided for update." }), { status: 400 });
        }
        console.log(filteredData);
        const updatedUser = await prisma.user.update({
            where: { id: userIdToUpdate },
            data: filteredData, 
        });

        return new NextResponse(JSON.stringify(updatedUser), { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}