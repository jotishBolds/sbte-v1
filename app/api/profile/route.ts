// File: app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
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
        teacher: true,
        student: true,
        financeManager: true,
        alumnus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Error fetching profile", error: (error as Error).message },
      { status: 500 }
    );
  }
}

const MaritalStatusEnum = z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]);
const CasteEnum = z.enum(["GENERAL", "OBC", "SC", "ST"]);
const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

const updateProfileSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
  headOfDepartment: z
    .object({
      name: z.string().optional(),
      phoneNo: z.string().optional(),
      address: z.string().optional(),
      qualification: z.string().optional(),
      experience: z.string().optional(),
    })
    .optional(), // Optional HOD data
  teacher: z
    .object({
      name: z.string().optional(),
      phoneNo: z.string().optional(),
      address: z.string().optional(),
      qualification: z.string().optional(),
      designationId: z.string().optional(),
      categoryId: z.string().optional(),
      experience: z.string().optional(),
      maritalStatus: MaritalStatusEnum.optional(),
      joiningDate: z.string().optional(),
      gender: GenderEnum.optional(),
      religion: z.string().optional(),
      caste: CasteEnum.optional(),
      isLocalResident: z.boolean().optional(),
      isDifferentlyAbled: z.boolean().optional(),
      hasResigned: z.boolean().optional(),
    })
    .optional(),
});

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const {
      username,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
      headOfDepartment,
      teacher,
    } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        headOfDepartment: true,
        teacher: true,
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

    const updatedData = await prisma.$transaction(async (prisma) => {
      // Update user basic info
      let updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("New passwords do not match");
        }
        updateData.password = await hash(newPassword, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Only update HOD if the user is HOD
      if (session.user.role === "HOD" && headOfDepartment) {
        if (user.headOfDepartment) {
          // Update existing HOD record
          await prisma.headOfDepartment.update({
            where: { id: user.headOfDepartment.id },
            data: headOfDepartment,
          });
        } else {
          const department = await prisma.department.findFirst({
            where: { collegeId: user.collegeId! },
          });

          if (!department) {
            throw new Error("No department found for this college");
          }

          await prisma.headOfDepartment.create({
            data: {
              ...headOfDepartment,
              userId: user.id,
              departmentId: department.id,
            },
          });
        }
      }

      // Only update teacher if the user is TEACHER
      if (session.user.role === "TEACHER" && teacher) {
        if (user.teacher) {
          await prisma.teacher.update({
            where: { id: user.teacher.id },
            data: {
              ...teacher,
              joiningDate: teacher.joiningDate
                ? new Date(teacher.joiningDate)
                : undefined,
            },
          });
        }
      }

      return { user: updatedUser };
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedData.user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Error updating profile", error: (error as Error).message },
      { status: 500 }
    );
  }
}
