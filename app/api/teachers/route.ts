// File: app/api/teachers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { createApiResponse, createApiErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !["HOD", "COLLEGE_SUPER_ADMIN", "TEACHER"].includes(session.user.role)
    ) {
      return createApiErrorResponse("Unauthorized", 401);
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return createApiErrorResponse("College ID not found", 400);
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
      return createApiErrorResponse("No teachers found for this college.", 404);
    }

    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      departmentId: teacher.user.department?.id,
      departmentName: teacher.user.department?.name,
    }));

    return createApiResponse(formattedTeachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return createApiErrorResponse("Error fetching teachers", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!session || session.user.role !== "TEACHER") {
      return createApiErrorResponse("Unauthorized", 401);
    }
    // Fetch teacher and user details
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true, // Include the related user details
      },
    });

    if (!teacher) {
      return createApiErrorResponse("Teacher not found here.", 404);
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
      where: { userId },
      include: {
        user: true, // Include the related updated user details
      },
    });

    return createApiResponse(updatedTeacherWithUser);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return createApiErrorResponse("Internal Server Error", 500);
  }
}
