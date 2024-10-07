// File: app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { hash, compare } from "bcrypt";
import prisma from "@/src/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        headOfDepartment: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Error fetching profile", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      username,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
      headOfDepartment,
    } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        headOfDepartment: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password if provided
    if (currentPassword) {
      const isPasswordValid = await compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 400 }
        );
      }
    }

    // Update user data
    let updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // Update password if provided
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { message: "New passwords do not match" },
          { status: 400 }
        );
      }
      updateData.password = await hash(newPassword, 10);
    }

    // Perform the user update
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    // Update HOD-specific data if the user is an HOD
    if (user.role === "HOD" && headOfDepartment) {
      if (user.headOfDepartment) {
        await prisma.headOfDepartment.update({
          where: { id: user.headOfDepartment.id },
          data: {
            name: headOfDepartment.name,
            phoneNo: headOfDepartment.phoneNo,
            address: headOfDepartment.address,
            qualification: headOfDepartment.qualification,
            experience: headOfDepartment.experience,
          },
        });
      } else {
        await prisma.headOfDepartment.create({
          data: {
            user: { connect: { id: user.id } },
            department: { connect: { id: headOfDepartment.departmentId } },
            name: headOfDepartment.name,
            phoneNo: headOfDepartment.phoneNo,
            address: headOfDepartment.address,
            qualification: headOfDepartment.qualification,
            experience: headOfDepartment.experience,
          },
        });
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Error updating profile", error: (error as Error).message },
      { status: 500 }
    );
  }
}
