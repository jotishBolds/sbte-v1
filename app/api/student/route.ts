import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { hash } from "bcrypt";
import prisma from "@/src/lib/prisma";
import { z } from "zod";

// Zod schema for student validation
const studentSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  dob: z.string(),
  personalEmail: z.string().email("Invalid personal email"),
  phoneNo: z.string().min(10, "Phone number must be at least 10 digits"),
  studentAvatar: z.string().optional(),
  abcId: z.string().optional(),
  lastCollegeAttended: z.string().optional(),
  batchYearId: z.string().min(1, "Batch year is required"),
  admissionYearId: z.string().min(1, "Admission year is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  termId: z.string().min(1, "Term is required"),
  gender: z.string(),
  isLocalStudent: z.boolean().default(false),
  isDifferentlyAbled: z.boolean().default(false),
  motherName: z.string().min(1, "Mother's name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  caste: z.string().optional(),
  admissionCategory: z.string().optional(),
  resident: z.string().optional(),
  admissionDate: z.string(),
  graduateDate: z.string().optional(),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  permanentCountry: z.string().min(1, "Country is required"),
  permanentState: z.string().min(1, "State is required"),
  permanentCity: z.string().min(1, "City is required"),
  permanentPincode: z.string().min(6, "Pincode must be at least 6 digits"),
  guardianName: z.string().optional(),
  guardianGender: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianMobileNo: z.string().optional(),
  guardianRelation: z.string().optional(),
  programId: z.string().min(1, "Program ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const collegeIdParam = searchParams.get("collegeId");
  const departmentIdParam = searchParams.get("departmentId");
  const programIdParam = searchParams.get("programId");

  // Determine the collegeId based on the user's role
  let collegeId;

  if (
    session.user.role === "SBTE" ||
    session.user.role === "EDUCATION_DEPARTMENT"
  ) {
    if (!collegeIdParam) {
      return NextResponse.json(
        {
          error:
            "collegeId is required for SBTE and EDUCATION_DEPARTMENT roles",
        },
        { status: 400 }
      );
    }
    collegeId = collegeIdParam; // Use collegeId from query parameter
  } else if (
    session.user.role === "COLLEGE_SUPER_ADMIN" ||
    session.user.role === "HOD"
  ) {
    collegeId = session.user.collegeId; // Use collegeId from session
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Verify if college, department, and program exist when passed
    const [collegeExists, departmentExists, programExists] = await Promise.all([
      prisma.college.findUnique({ where: { id: collegeId } }),
      departmentIdParam
        ? prisma.department.findUnique({ where: { id: departmentIdParam } })
        : Promise.resolve(true),
      programIdParam
        ? prisma.program.findUnique({ where: { id: programIdParam } })
        : Promise.resolve(true),
    ]);

    if (!collegeExists) {
      return NextResponse.json(
        { message: "Invalid College ID" },
        { status: 400 }
      );
    }
    if (departmentIdParam && !departmentExists) {
      return NextResponse.json(
        { message: "Invalid Department ID" },
        { status: 400 }
      );
    }
    if (programIdParam && !programExists) {
      return NextResponse.json(
        { message: "Invalid Program ID" },
        { status: 400 }
      );
    }

    // Fetch students based on the resolved collegeId, with optional departmentId and programId filters
    const students = await prisma.student.findMany({
      where: {
        collegeId,
        ...(departmentIdParam && { departmentId: departmentIdParam }),
        ...(programIdParam && { programId: programIdParam }),
      },
      include: {
        user: true, // Include user details if needed
        program: true, // Include program details if needed
        department: true, // Include department details if needed
      },
    });

    // Check if no students are found and return a message if so
    if (students.length === 0) {
      return NextResponse.json(
        { message: "No students found" },
        { status: 200 }
      );
    }

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Error fetching students", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and authorized
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collegeId = session.user.collegeId;
  if (!collegeId) {
    return NextResponse.json(
      { message: "College not associated with admin" },
      { status: 400 }
    );
  }

  try {
    // Parse and validate the request body with Zod
    const body = await request.json();
    const validatedData = studentSchema.parse(body);

    // Check for existing user with same username or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          { email: validatedData.email },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username or email already in use" },
        { status: 400 }
      );
    }

    // Verify if the IDs provided exist in their respective tables
    const [
      batchYearExists,
      admissionYearExists,
      academicYearExists,
      termExists,
      programExists,
      departmentExists,
    ] = await Promise.all([
      prisma.batchYear.findUnique({ where: { id: validatedData.batchYearId } }),
      prisma.admissionYear.findUnique({
        where: { id: validatedData.admissionYearId },
      }),
      prisma.academicYear.findUnique({
        where: { id: validatedData.academicYearId },
      }),
      prisma.semester.findUnique({ where: { id: validatedData.termId } }),
      prisma.program.findUnique({ where: { id: validatedData.programId } }),
      prisma.department.findUnique({
        where: { id: validatedData.departmentId },
      }),
    ]);

    if (!batchYearExists)
      return NextResponse.json(
        { message: "Invalid Batch Year ID" },
        { status: 400 }
      );
    if (!admissionYearExists)
      return NextResponse.json(
        { message: "Invalid Admission Year ID" },
        { status: 400 }
      );
    if (!academicYearExists)
      return NextResponse.json(
        { message: "Invalid Academic Year ID" },
        { status: 400 }
      );
    if (!termExists)
      return NextResponse.json({ message: "Invalid Term ID" }, { status: 400 });
    if (!programExists)
      return NextResponse.json(
        { message: "Invalid Program ID" },
        { status: 400 }
      );
    if (!departmentExists)
      return NextResponse.json(
        { message: "Invalid Department ID" },
        { status: 400 }
      );

    // Hash the password
    const hashedPassword = await hash(validatedData.password, 10);

    // Start a transaction to create the user and student records
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          username: validatedData.username,
          email: validatedData.email,
          password: hashedPassword,
          role: "STUDENT",
          collegeId: session.user.collegeId,
          departmentId: validatedData.departmentId,
        },
      });

      await prisma.student.create({
        data: {
          user: { connect: { id: user.id } },
          name: validatedData.name,
          dob: new Date(validatedData.dob),
          personalEmail: validatedData.personalEmail,
          phoneNo: validatedData.phoneNo,
          studentAvatar: validatedData.studentAvatar,
          enrollmentNo: null,
          abcId: validatedData.abcId,
          lastCollegeAttended: validatedData.lastCollegeAttended,
          batchYear: { connect: { id: validatedData.batchYearId } },
          admissionYear: { connect: { id: validatedData.admissionYearId } },
          academicYear: { connect: { id: validatedData.academicYearId } },
          term: { connect: { id: validatedData.termId } },
          gender: validatedData.gender,
          isLocalStudent: validatedData.isLocalStudent,
          isDifferentlyAbled: validatedData.isDifferentlyAbled,
          motherName: validatedData.motherName,
          fatherName: validatedData.fatherName,
          bloodGroup: validatedData.bloodGroup,
          religion: validatedData.religion,
          nationality: validatedData.nationality,
          caste: validatedData.caste,
          admissionCategory: validatedData.admissionCategory,
          resident: validatedData.resident,
          admissionDate: new Date(validatedData.admissionDate),
          graduateDate: validatedData.graduateDate
            ? new Date(validatedData.graduateDate)
            : null,
          permanentAddress: validatedData.permanentAddress,
          permanentCountry: validatedData.permanentCountry,
          permanentState: validatedData.permanentState,
          permanentCity: validatedData.permanentCity,
          permanentPincode: validatedData.permanentPincode,
          guardianName: validatedData.guardianName,
          guardianGender: validatedData.guardianGender,
          guardianEmail: validatedData.guardianEmail,
          guardianMobileNo: validatedData.guardianMobileNo,
          guardianRelation: validatedData.guardianRelation,
          program: { connect: { id: validatedData.programId } },
          department: { connect: { id: validatedData.departmentId } },
          college: { connect: { id: collegeId } },
        },
      });

      return user;
    });

    return NextResponse.json(
      { message: "Student user created successfully", user: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student user:", error);
    return NextResponse.json(
      {
        message: "Error creating student user",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
