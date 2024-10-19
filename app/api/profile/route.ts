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

// Zod schema for validation
const updateProfileSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
  name: z.string().optional(),
  phoneNo: z.string().optional(),
  address: z.string().optional(),
  qualification: z.string().optional(),
  designationId: z.string().optional(),
  categoryId: z.string().optional(),
  experience: z.string().optional(),
  maritalStatus: MaritalStatusEnum.optional(),
  joiningDate: z.string().optional(),
  gender: z.string().optional(),
  religion: z.string().optional(),
  caste: CasteEnum.optional(),  // Enum for caste
  isLocalResident: z.boolean().optional(),
  isDifferentlyAbled: z.boolean().optional(),
});

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRole = session.user.role;

    // Parse and validate the request body with Zod
    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid data", errors: result.error.errors }, { status: 400 });
    }

    const {
      username,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
      name,
      phoneNo,
      address,
      qualification,
      designationId,
      categoryId,
      experience,
      maritalStatus,
      joiningDate,
      gender,
      religion,
      caste,
      isLocalResident,
      isDifferentlyAbled,
    } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teacher: true,
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
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
      }
    }

    // Update user data
    let updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // Update password if provided
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ message: "New passwords do not match" }, { status: 400 });
      }
      updateData.password = await hash(newPassword, 10);
    }

    // Perform the user update
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    // Update role-specific data
    let updatedProfile;
    if (userRole === "HOD" && user.headOfDepartment) {
      updatedProfile = await prisma.headOfDepartment.update({
        where: { id: user.headOfDepartment.id },
        data: {
          name,
          phoneNo,
          address,
          qualification,
          experience,
        },
        include: { user: true },
      });
    } else if (userRole === "TEACHER" && user.teacher) {
      updatedProfile = await prisma.teacher.update({
        where: { id: user.teacher.id },
        data: {
          name,
          phoneNo,
          address,
          qualification,
          designationId,
          categoryId,
          experience,
          maritalStatus,
          joiningDate: joiningDate ? new Date(joiningDate) : undefined,
          gender,
          religion,
          caste,
          isLocalResident,
          isDifferentlyAbled,
        },
        include: { user: true, designation: true, category: true },
      });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      updatedProfile: updatedProfile || updateData,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Error updating profile", error: (error as Error).message },
      { status: 500 }
    );
  }
}



// export async function PUT(request: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session || !session.user || !session.user.email) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const {
//       username,
//       email,
//       currentPassword,
//       newPassword,
//       confirmPassword,
//       headOfDepartment,
//     } = await request.json();

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//       include: {
//         headOfDepartment: true,
//       },
//     });

//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     // Verify current password if provided
//     if (currentPassword) {
//       const isPasswordValid = await compare(currentPassword, user.password);
//       if (!isPasswordValid) {
//         return NextResponse.json(
//           { message: "Current password is incorrect" },
//           { status: 400 }
//         );
//       }
//     }

//     // Update user data
//     let updateData: any = {};
//     if (username) updateData.username = username;
//     if (email) updateData.email = email;

//     // Update password if provided
//     if (newPassword && confirmPassword) {
//       if (newPassword !== confirmPassword) {
//         return NextResponse.json(
//           { message: "New passwords do not match" },
//           { status: 400 }
//         );
//       }
//       updateData.password = await hash(newPassword, 10);
//     }

//     // Perform the user update
//     await prisma.user.update({
//       where: { email: session.user.email },
//       data: updateData,
//     });

//     // Update HOD-specific data if the user is an HOD
//     if (user.role === "HOD" && headOfDepartment) {
//       if (user.headOfDepartment) {
//         await prisma.headOfDepartment.update({
//           where: { id: user.headOfDepartment.id },
//           data: {
//             name: headOfDepartment.name,
//             phoneNo: headOfDepartment.phoneNo,
//             address: headOfDepartment.address,
//             qualification: headOfDepartment.qualification,
//             experience: headOfDepartment.experience,
//           },
//         });
//       } else {
//         await prisma.headOfDepartment.create({
//           data: {
//             user: { connect: { id: user.id } },
//             department: { connect: { id: headOfDepartment.departmentId } },
//             name: headOfDepartment.name,
//             phoneNo: headOfDepartment.phoneNo,
//             address: headOfDepartment.address,
//             qualification: headOfDepartment.qualification,
//             experience: headOfDepartment.experience,
//           },
//         });
//       }
//     }

//     return NextResponse.json({ message: "Profile updated successfully" });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     return NextResponse.json(
//       { message: "Error updating profile", error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
