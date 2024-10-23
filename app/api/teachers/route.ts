// File: app/api/teachers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcrypt";


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !["HOD", "COLLEGE_SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { message: "College ID not found" },
        { status: 400 }
      );
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        user: {
          collegeId: collegeId,
        },
      },
      select: {
        id: true,
        name: true,
        user: {
          select: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Check if no teachers are found
    if (teachers.length === 0) {
      return NextResponse.json(
        { message: "No teachers found for this college." },
        { status: 404 } // Using 404 Not Found status
      );
    }

    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      departmentId: teacher.user.department?.id,
      departmentName: teacher.user.department?.name,
    }));

    return NextResponse.json(formattedTeachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { message: "Error fetching teachers" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!session || session.user.role !== "TEACHER") {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
    // Fetch teacher and user details
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true, // Include the related user details
      },
    });

    if (!teacher) {
      return new NextResponse(JSON.stringify({ message: "Teacher not found here." }), { status: 404 });
    }

    const data = await request.json();
    const { email, username, password, name, phoneNo, address, qualification, designation, experience } = data;

    const updateData: any = {};

    // Handle updating the User table
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    // Update the Teacher table
    const updatedTeacher = await prisma.teacher.update({
      where: { userId },
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
        where: { id: userId },
        data: updateData,
      });
    }

    // Fetch the updated teacher along with user details
    const updatedTeacherWithUser = await prisma.teacher.findUnique({
      where: { userId},
      include: {
        user: true, // Include the related updated user details
      },
    });

    return NextResponse.json(updatedTeacherWithUser,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating teacher:", error);
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
