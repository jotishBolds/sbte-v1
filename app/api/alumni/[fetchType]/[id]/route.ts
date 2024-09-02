import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";
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

export async function PATCH(
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

        const alumnusToUpdate = await prisma.alumnus.findUnique({
            where: { id },
        });
        if (!alumnusToUpdate) {
            return new NextResponse(JSON.stringify({ message: "Alumnus not found with this ID" }), { status: 404 });
        }

        const updatedAlumnus = await prisma.alumnus.update({
            where: { id },
            data: { verified: body.verified },
        });

        return NextResponse.json({ updatedAlumnus }, { status: 200 });
    } catch (error) {
        console.error("Error verifying alumnus:", (error as Error).message);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const { id } = params;

        if (!id) {
            return new NextResponse(JSON.stringify({ message: "ID is required" }), { status: 400 });
        }

        const alumnusToDelete = await prisma.alumnus.findUnique({
            where: { id },
            include: { user: true } // Include user if you need to handle user record deletion
        });

        if (!alumnusToDelete) {
            return new NextResponse(JSON.stringify({ message: "Alumnus not found with this ID" }), { status: 404 });
        }

        await prisma.alumnus.delete({
            where: { id }
        });


        if (alumnusToDelete.user) { 
            await prisma.user.delete({
                where: { id: alumnusToDelete.user.id }
            });
        }

        
        return NextResponse.json({ message: "Alumnus and associated user deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting alumnus:", (error as Error).message);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
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

        const data = await request.json();
        let {
            email, password, username, collegeId,
            name, phoneNo, dateOfBirth, address,
            departmentId, batchYear, graduationYear,
            gpa, jobStatus, currentEmployer, currentPosition,
            industry, linkedInProfile, achievements
        } = data;

        // Optional field validation
        if (gpa !== undefined && gpa !== null && gpa !== "") {
            gpa = parseFloat(gpa);
            if (isNaN(gpa)) {
                return new NextResponse(JSON.stringify({ message: "Invalid GPA value" }), { status: 400 });
            }
        } else {
            gpa = null; // Set GPA to null if it's not provided
        }
        // Check if the alumnus exists
        const alumnusToUpdate = await prisma.alumnus.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!alumnusToUpdate) {
            return new NextResponse(JSON.stringify({ message: "Alumnus not found with this ID" }), { status: 404 });
        }

        const userId = alumnusToUpdate.userId;

        // Check if the user exists
        const userToUpdate = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userToUpdate) {
            return new NextResponse(JSON.stringify({ message: "User not found with this ID" }), { status: 404 });
        }

        // Check if the email is already used by another user
        if (email) {
            const existingUserWithEmail = await prisma.user.findFirst({
                where: { email }
            });

            if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
                return new NextResponse(JSON.stringify({ message: "Email is already in use by another user" }), { status: 400 });
            }
        }




        const updateData: any = {
            name,
            phoneNo,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            address,
            batchYear,
            graduationYear,
            gpa,
            jobStatus,
            currentEmployer,
            currentPosition,
            industry,
            linkedInProfile,
            achievements
        };

        if (departmentId && departmentId.trim() !== "") {
            updateData.departmentId = departmentId; // Only add departmentId if it's not empty
        }

        // Update the alumnus record
        const updatedAlumnus = await prisma.alumnus.update({
            where: { id },
            data: updateData,
        });

        // Optionally, update the user record if email, password, or username is provided
        if (email || password || username || collegeId || departmentId) {

            const userId = alumnusToUpdate.userId;

            // Check if the user exists
            const userToUpdate = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!userToUpdate) {
                return new NextResponse(JSON.stringify({ message: "User not found with this ID" }), { status: 404 });
            }

            // Check if the email is already used by another user
            if (email) {
                const existingUserWithEmail = await prisma.user.findFirst({
                    where: { email }
                });

                if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
                    return new NextResponse(JSON.stringify({ message: "Email is already in use by another user" }), { status: 400 });
                }
            }

            const userUpdates: any = {};
            if (email) userUpdates.email = email;
            if (password) userUpdates.password = await bcrypt.hash(password, 10);
            if (username) userUpdates.username = username;
            if (collegeId && collegeId != '') userUpdates.collegeId = collegeId;
            if (departmentId && departmentId != '') userUpdates.departmentId = departmentId;

            const updatedUser = await prisma.user.update({
                where: { id: updatedAlumnus.userId },
                data: userUpdates,
            });

            return NextResponse.json({ message: "Alumnus and user data updated successfully", alumnus: updatedAlumnus, user: updatedUser }, { status: 200 });
        }

        return NextResponse.json({ message: "Alumnus data updated successfully", alumnus: updatedAlumnus }, { status: 200 });

    } catch (error) {
        console.error("Error updating alumnus data:", (error as Error).message);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}