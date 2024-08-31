import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import bcrypt from "bcrypt";

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string; updaterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
    }

    const { userId, updaterId } = params;

    if (!userId || !updaterId) {
      return new NextResponse(JSON.stringify({ message: "User ID and Updater ID are required." }), { status: 400 });
    }

    // Ensure that the updater's ID matches the session user's ID
    if (updaterId !== userId) {
      return new NextResponse(JSON.stringify({ message: "You are not authorized to perform this update." }), { status: 403 });
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return new NextResponse(JSON.stringify({ message: "User not found." }), { status: 404 });
    }

    const data = await request.json();
    const { email, username, password, name, phoneNo, address, qualification, designation, experience, father_name, mother_name, dob, enrollmentNo, admissionYear, collegeId, departmentId } = data;

    const updateData: any = {};

    // Handle updating the User table
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    console.log(session.user);
    // Handle updates based on the user role
    switch (session.user.role) {
      case "COLLEGE_SUPER_ADMIN":
        // CollegeSuperAdmin can only update their username, email, and password
        break;
      
      case "HOD":
        await prisma.headOfDepartment.update({
          where: { userId: userId },
          data: {
            name,
            phoneNo,
            address,
            qualification,
            experience,
          },
        });
        break;

      case "TEACHER":
        console.log("entered teacher");
        await prisma.teacher.update({
          where: { userId: userId },
          data: {
            name,
            phoneNo,
            address,
            qualification,
            experience,
            designation,
          },
        });
        break;

      case "FINANCE_MANAGER":
        await prisma.financeManager.update({
          where: { userId: userId },
          data: {
            name,
            phoneNo,
            address,
          },
        });
        break;

    //   case "STUDENT":
    //     await prisma.student.update({
    //       where: { userId: userId },
    //       data: {
    //         name,
    //         phoneNo,
    //         address,
    //         father_name,
    //         mother_name,
    //         dob,
    //         enrollmentNo,
    //         admissionYear,
    //         departmentId,
    //         collegeId,
    //       },
    //     });
    //     break;

    //   case "ALUMNUS":
    //     await prisma.alumnus.update({
    //       where: { userId: userId },
    //       data: {
    //         name,
    //         phoneNo,
    //         address,
    //         departmentId,
    //       },
    //     });
    //     break;

      default:
        return new NextResponse(JSON.stringify({ message: "Invalid user role." }), { status: 403 });
    }

    // Update the User table
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return new NextResponse(JSON.stringify({ user: updatedUser }), { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
 