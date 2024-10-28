import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import { z } from "zod";
import { hash } from "bcrypt";


// GET student by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "HOD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch the student by ID, including necessary relations
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        program: true,
        department: true,
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Ensure collegeId matches the user’s college if the role requires it
    if (
      // (session.user.role === "COLLEGE_SUPER_ADMIN" || session.user.role === "HOD") &&
      student.collegeId !== session.user.collegeId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ message: "Error fetching student", error: (error as Error).message }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "HOD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch student to verify existence and retrieve userId for deletion
    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        userId: true,
        collegeId: true,
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Check if the student's collegeId matches the session user's collegeId
    if (student.collegeId !== session.user.collegeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the student and associated user in a transaction
    await prisma.$transaction([
      prisma.student.delete({ where: { id } }),
      prisma.user.delete({ where: { id: student.userId } }),
    ]);

    return NextResponse.json({ message: "Student and associated user deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting student and user:", error);
    return NextResponse.json(
      { message: "Error deleting student and associated user", error: (error as Error).message },
      { status: 500 }
    );
  }
}

const userUpdateSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(), // If you implement hashed passwords, handle hashing separately
});

// Define Zod schema for validation based on `Student` model
const studentUpdateSchema = z.object({
  enrollmentNo: z.string().optional(),
  name: z.string().optional(),
  dob: z.date().optional(),
  personalEmail: z.string().email().optional(),
  phoneNo: z.string().optional(),
  studentAvatar: z.string().url().optional(),
  abcId: z.string().optional(),
  lastCollegeAttended: z.string().optional(),
  batchYearId: z.string().optional(),
  admissionYearId: z.string().optional(),
  academicYearId: z.string().optional(),
  termId: z.string().optional(),
  gender: z.string().optional(),
  isLocalStudent: z.boolean().optional(),
  isDifferentlyAbled: z.boolean().optional(),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  caste: z.string().optional(),
  admissionCategory: z.string().optional(),
  resident: z.string().optional(),
  admissionDate: z.date().optional(),
  graduateDate: z.date().optional(),
  permanentAddress: z.string().optional(),
  permanentCountry: z.string().optional(),
  permanentState: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentPincode: z.string().optional(),
  guardianName: z.string().optional(),
  guardianGender: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianMobileNo: z.string().optional(),
  guardianRelation: z.string().optional(),
  programId: z.string().optional(),
  collegeId: z.string().optional(),
  departmentId: z.string().optional(),
});
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Authentication and authorization checks
    if (
      !session ||
      !session.user ||
      (session.user.role !== "COLLEGE_SUPER_ADMIN" &&
        session.user.role !== "STUDENT")
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const studentData = studentUpdateSchema.parse(body);
    let userData = userUpdateSchema.parse(body);

    // Hash the password if it is provided
    if (userData.password) {
      userData.password = await hash(userData.password, 10); // bcrypt hashing with salt rounds of 10
    }

    // Start transaction to update User and Student tables
    const result = await prisma.$transaction(async (prisma) => {
      // Fetch the Student and associated User records to validate ownership and permissions
      const student = await prisma.student.findUnique({
        where: { id: params.id },
        include: {
          user: true,
          college: true, // Fetch college details for super admin verification
        },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      // Student role can only update their own data
      if (session.user.role === "STUDENT" && student.userId !== session.user.id) {
        throw new Error("Unauthorized to update another student's profile");
      }

      // College super admin can only update students in their own college
      if (
        session.user.role === "COLLEGE_SUPER_ADMIN" &&
        student.collegeId !== session.user.collegeId
      ) {
        throw new Error(
          "Unauthorized to update student from a different college"
        );
      }

      // Update User table if user fields are provided
      const updatedUser = userData.username || userData.email || userData.password
        ? await prisma.user.update({
            where: { id: student.userId },
            data: userData,
          })
        : student.user;

      // Update Student table
      const updatedStudent = await prisma.student.update({
        where: { id: params.id },
        data: studentData,
      });

      return { updatedUser, updatedStudent };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating student and user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error updating student and user" },
      { status: 500 }
    );
  }
}