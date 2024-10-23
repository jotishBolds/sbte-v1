import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import bcrypt from "bcrypt";

export async function PUT(
  request: NextRequest,
  { params }: { params: { operation: string; id: string; updaterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 403,
      });
    }

    const { operation, updaterId } = params;
    const teacherId = params.id;

    if (!teacherId || !updaterId) {
      return new NextResponse(
        JSON.stringify({ message: "User ID and Updater ID are required." }),
        { status: 400 }
      );
    }

    // Fetch teacher and user details
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true, // Include the related user details
      },
    });

    if (!teacher) {
      return new NextResponse(
        JSON.stringify({ message: "Teacher not found here." }),
        { status: 404 }
      );
    }

    // Ensure that the updater's ID matches the teacher's user ID
    if (updaterId !== teacher.user.id) {
      return new NextResponse(
        JSON.stringify({
          message: "You are not authorized to perform this update.",
        }),
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      email,
      username,
      password,
      name,
      phoneNo,
      address,
      qualification,
      designation,
      experience,
    } = data;

    const updateData: any = {};

    // Handle updating the User table
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    // Update the Teacher table
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        name: name || teacher.name,
        phoneNo: phoneNo || teacher.phoneNo,
        address: address || teacher.address,
        qualification: qualification || teacher.qualification,
        designation: designation || teacher.designationId,
        experience: experience || teacher.experience,
      },
    });

    // Update the User table if any user details were changed
    let updatedUser;
    if (Object.keys(updateData).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: teacher.user.id },
        data: updateData,
      });
    }

    // Fetch the updated teacher along with user details
    const updatedTeacherWithUser = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true, // Include the related updated user details
      },
    });

    return NextResponse.json(updatedTeacherWithUser, { status: 200 });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
