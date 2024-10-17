//api/register-users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

// Helper function to get admin's college ID
async function getAdminCollege(userId: string) {
  const adminUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { college: true },
  });

  if (!adminUser || !adminUser.college) {
    throw new Error("College not found");
  }

  return adminUser.college.id;
}

// GET request handler
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const collegeId = await getAdminCollege(session.user.id);

    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        collegeId: collegeId,
      },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}

// PUT request handler
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getServerSession(authOptions);
//   if (
//     !session ||
//     !session.user ||
//     (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
//   ) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   if (!session.user.collegeId) {
//     return NextResponse.json(
//       { message: "College not associated with admin" },
//       { status: 400 }
//     );
//   }

//   try {
//     const body = await request.json();
//     const { username, email, role } = body;

//     const updatedUser = await prisma.user.updateMany({
//       where: {
//         id: params.id,
//         collegeId: session.user.collegeId,
//       },
//       data: { username, email, role },
//     });

//     if (updatedUser.count === 0) {
//       return NextResponse.json(
//         { message: "User not found or not in your college" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ message: "User updated successfully" });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     return NextResponse.json(
//       { message: "Error updating user", error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Check if session is valid and user has permission
  if (
    !session ||
    !session.user ||
    (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Ensure collegeId is present in session
  if (!session.user.collegeId) {
    return NextResponse.json(
      { message: "College not associated with admin" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { username, email, role, ...additionalData } = body;

    // Check if user exists by ID and belongs to the same college
    const existingUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        collegeId: session.user.collegeId, // Ensure the user is from the same college
      },
    });

    // If no user is found, return a 404 error
    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found or not in your college" },
        { status: 404 }
      );
    }

    // Start a transaction to ensure both updates happen together
    const updatedData = await prisma.$transaction(async (prisma) => {
      let updatedUser;
      // Update user details only if username or email is provided
      if (username || email) {
        const updateData: any = {};

        if (username) {
          updateData.username = username;
        }
        if (email) {
          updateData.email = email;
        }

        // Update user data in the User table using params.id and session.user.collegeId
        updatedUser = await prisma.user.update({
          where: {
            id: params.id,
          },
          data: updateData,
        });
      } else {
        updatedUser = existingUser; // If no username/email is provided, keep the existing user data
      }

      let roleSpecificUpdate;
      // Handle role-specific updates based on the role
      switch (role) {
        case "HOD":
          roleSpecificUpdate = await prisma.headOfDepartment.update({
            where: { userId: params.id },
            data: {
              name: additionalData?.name || undefined,
              phoneNo: additionalData?.phoneNo || undefined,
              address: additionalData?.address || undefined,
              qualification: additionalData?.qualification || undefined,
              experience: additionalData?.experience || undefined,
            },
          });
          break;

        case "TEACHER":
          const teacherData = {
            name: additionalData.name || undefined,
            phoneNo: additionalData.phoneNo || undefined,
            address: additionalData.address || undefined,
            qualification: additionalData.qualification || undefined,
            experience: additionalData.experience || undefined,
            designationId: additionalData.designationId || undefined,
            categoryId: additionalData.categoryId || undefined,
            joiningDate: additionalData.joiningDate
              ? new Date(additionalData.joiningDate)
              : undefined,
            gender: additionalData.gender || undefined,
            religion: additionalData.religion || undefined,
            caste: additionalData.caste || undefined,
            hasResigned: additionalData.hasResigned,
            maritalStatus: additionalData.maritalStatus || undefined,
            isLocalResident: additionalData.isLocalResident,
            isDifferentlyAbled: additionalData.isDifferentlyAbled,
          };

          roleSpecificUpdate = await prisma.teacher.upsert({
            where: { userId: params.id },
            update: teacherData,
            create: { ...teacherData, userId: params.id },
          });
          break;

        case "FINANCE_MANAGER":
          const financeData: any = {
            name: additionalData?.name || undefined,
            phoneNo: additionalData?.phoneNo || undefined,
            address: additionalData?.address || undefined,
          };

          roleSpecificUpdate = await prisma.financeManager.update({
            where: { userId: params.id },
            data: financeData,
          });
          break;

        case "STUDENT":
          const studentData: any = {
            name: additionalData?.name || undefined,
            phoneNo: additionalData?.phoneNo || undefined,
            permanentAddress: additionalData?.permanentAddress || undefined,
            dob: additionalData?.dob || undefined,
            programId: additionalData?.programId || undefined,
            departmentId: additionalData?.departmentId || undefined,
            gender: additionalData?.gender || undefined,
          };

          // Conditionally set boolean fields only if they are provided
          if (additionalData.isLocalStudent !== undefined) {
            studentData.isLocalStudent = additionalData.isLocalStudent;
          }
          if (additionalData.isDifferentlyAbled !== undefined) {
            studentData.isDifferentlyAbled = additionalData.isDifferentlyAbled;
          }

          roleSpecificUpdate = await prisma.student.update({
            where: { userId: params.id },
            data: studentData,
          });
          break;

        case "ALUMNUS":
          const alumnusData: any = {
            name: additionalData?.name || undefined,
            phoneNo: additionalData?.phoneNo || undefined,
            dateOfBirth: additionalData?.dateOfBirth || undefined,
            address: additionalData?.address || undefined,
            departmentId: additionalData?.departmentId || undefined,
            programId: additionalData?.programId || undefined,
            graduationYear: additionalData?.graduationYear || undefined,
            jobStatus: additionalData?.jobStatus || undefined,
            currentEmployer: additionalData?.currentEmployer || undefined,
            currentPosition: additionalData?.currentPosition || undefined,
            industry: additionalData?.industry || undefined,
            linkedInProfile: additionalData?.linkedInProfile || undefined,
            achievements: additionalData?.achievements || undefined,
            verified: additionalData?.verified || false,
          };

          roleSpecificUpdate = await prisma.alumnus.update({
            where: { userId: params.id },
            data: alumnusData,
          });
          break;

        default:
          throw new Error("Invalid role");
      }

      // Return both the user update and the role-specific update
      return { updatedUser, roleSpecificUpdate };
    });

    // Return the updated data
    return NextResponse.json({
      message: "User updated successfully",
      user: updatedData.updatedUser,
      roleData: updatedData.roleSpecificUpdate,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE request handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = params.id;

    // Delete related records first
    await prisma.headOfDepartment.deleteMany({
      where: { userId: id },
    });

    await prisma.teacher.deleteMany({
      where: { userId: id },
    });

    await prisma.financeManager.deleteMany({
      where: { userId: id },
    });

    await prisma.student.deleteMany({
      where: { userId: id },
    });

    await prisma.alumnus.deleteMany({
      where: { userId: id },
    });

    // Now delete the user
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error: (error as Error).message },
      { status: 500 }
    );
  }
}
