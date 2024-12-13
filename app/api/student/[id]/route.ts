//api/student/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import { z } from "zod";
import { hash } from "bcryptjs";

// GET student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    session.user.role !== "COLLEGE_SUPER_ADMIN" &&
    session.user.role !== "HOD"
  ) {
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
        batchYear: true,
        academicYear: true,
        term: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
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
    return NextResponse.json(
      { message: "Error fetching student", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    session.user.role !== "COLLEGE_SUPER_ADMIN" &&
    session.user.role !== "HOD"
  ) {
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
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
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

    return NextResponse.json(
      { message: "Student and associated user deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting student and user:", error);
    return NextResponse.json(
      {
        message: "Error deleting student and associated user",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

const userUpdateSchema = z.object({
  username: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});

// Schema for student-specific fields (removed user-related fields)
const studentUpdateSchema = z.object({
  name: z.string().optional(),
  dob: z.string().optional(),
  enrollmentNo: z.string().optional(),
  personalEmail: z.string().email("Invalid personal email").optional(),
  phoneNo: z.string().optional(),
  studentAvatar: z.string().optional(),
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
  admissionDate: z.string().optional(),
  graduateDate: z.string().optional(),
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
  departmentId: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      session.user.role !== "COLLEGE_SUPER_ADMIN" &&
      session.user.role !== "HOD" &&
      session.user.role !== "SBTE_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Separate user and student data
    const { username, email, password, ...studentFields } = body;

    // Validate the separated data
    const studentData = studentUpdateSchema.parse(studentFields);
    const userData = userUpdateSchema.parse({ username, email, password });

    // Start transaction to update User and Student tables
    const result = await prisma.$transaction(async (prisma) => {
      // Fetch the Student and associated User records
      const student = await prisma.student.findUnique({
        where: { id: params.id },
        include: {
          user: true,
          college: true,
        },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      // Authorization checks
      if (
        session.user.role === "STUDENT" &&
        student.userId !== session.user.id
      ) {
        throw new Error("Unauthorized to update another student's profile");
      }

      if (
        session.user.role === "COLLEGE_SUPER_ADMIN" &&
        student.collegeId !== session.user.collegeId
      ) {
        throw new Error(
          "Unauthorized to update student from a different college"
        );
      }

      // Prepare user update data
      const userUpdateData: any = {};
      if (userData.username) userUpdateData.username = userData.username;
      if (userData.email) userUpdateData.email = userData.email;
      if (userData.password) {
        userUpdateData.password = await hash(userData.password, 10);
      }

      // Update User if there are user fields to update
      const updatedUser =
        Object.keys(userUpdateData).length > 0
          ? await prisma.user.update({
              where: { id: student.userId },
              data: userUpdateData,
            })
          : student.user;

      // Convert date strings to Date objects if they exist
      const processedStudentData = {
        ...studentData,
        dob: studentData.dob ? new Date(studentData.dob) : undefined,
        admissionDate: studentData.admissionDate
          ? new Date(studentData.admissionDate)
          : undefined,
        graduateDate: studentData.graduateDate
          ? new Date(studentData.graduateDate)
          : undefined,
      };

      // Update Student
      const updatedStudent = await prisma.student.update({
        where: { id: params.id },
        data: processedStudentData,
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

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Error updating student and user" },
      { status: 500 }
    );
  }
}
