import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { hash } from "bcryptjs";
import prisma from "@/src/lib/prisma";
import { z } from "zod";
import { passwordSchema } from "@/lib/password-validation";

const createUserSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum([
      "HOD",
      "TEACHER",
      "FINANCE_MANAGER",
      "STUDENT",
      "ALUMNUS",
      "ADM",
    ]),
    departmentId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (session.user.role !== "COLLEGE_SUPER_ADMIN" &&
        session.user.role !== "ADM")
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.collegeId) {
      return NextResponse.json(
        { message: "College not associated with admin" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [
            "HOD",
            "TEACHER",
            "FINANCE_MANAGER",
            "STUDENT",
            "ALUMNUS",
            "ADM",
          ],
        },
        collegeId: session.user.collegeId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user ||
    (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.collegeId) {
    return NextResponse.json(
      { message: "College not associated with admin" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { username, email, password, role, departmentId } =
      validationResult.data;

    // Verify email is not already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash password with increased security
    const hashedPassword = await hash(password, 12);

    const user = await prisma.$transaction(async (prisma) => {
      // Create base user
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
          collegeId: session.user.collegeId,
          departmentId,
        },
      });

      // Create password history
      await prisma.passwordHistory.create({
        data: {
          userId: newUser.id,
          hashedPassword,
        },
      });

      // Create role-specific records
      switch (role) {
        case "HOD":
          if (!departmentId) {
            throw new Error("Department ID is required for HOD creation");
          }
          // Check if HOD already exists for department
          const existingHOD = await prisma.headOfDepartment.findUnique({
            where: { departmentId },
          });

          if (existingHOD) {
            throw new Error(
              "A Head of Department already exists for this department"
            );
          }

          await prisma.headOfDepartment.create({
            data: {
              userId: newUser.id,
              departmentId,
              name: username,
              phoneNo: "",
              address: "",
              qualification: "",
              experience: "",
            },
          });
          break;

        case "TEACHER":
          await prisma.teacher.create({
            data: {
              userId: newUser.id,
              name: username,
              phoneNo: undefined,
              address: undefined,
              qualification: undefined,
              experience: undefined,
              hasResigned: false,
              maritalStatus: undefined,
              joiningDate: undefined,
              gender: undefined,
              religion: undefined,
              caste: undefined,
              isLocalResident: false,
              isDifferentlyAbled: false,
            },
          });
          break;

        case "FINANCE_MANAGER":
          if (!session.user.collegeId) {
            throw new Error(
              "College ID is required for Finance Manager creation"
            );
          }
          await prisma.financeManager.create({
            data: {
              userId: newUser.id,
              name: username,
              phoneNo: "",
              address: "",
              collegeId: session.user.collegeId,
            },
          });
          break;

        case "STUDENT":
          // Get the latest academic year, batch year, and admission year
          const academicYear = await prisma.academicYear.findFirst({
            where: { collegeId: session.user.collegeId },
            orderBy: { startDate: "desc" },
          });

          const batchYear = await prisma.batchYear.findFirst({
            where: { collegeId: session.user.collegeId },
            orderBy: { year: "desc" },
          });

          const admissionYear = await prisma.admissionYear.findFirst({
            where: { collegeId: session.user.collegeId },
            orderBy: { year: "desc" },
          });

          const semester = await prisma.semester.findFirst({
            where: { collegeId: session.user.collegeId },
          });

          if (!departmentId) {
            throw new Error("Department ID is required for student creation");
          }

          // Find a program for the department
          const program = await prisma.program.findFirst({
            where: { departmentId: departmentId },
          });

          if (
            !academicYear ||
            !batchYear ||
            !admissionYear ||
            !semester ||
            !program ||
            !session.user.collegeId
          ) {
            await prisma.user.delete({ where: { id: newUser.id } });
            return NextResponse.json(
              { message: "Required academic data not found" },
              { status: 400 }
            );
          }

          await prisma.student.create({
            data: {
              userId: newUser.id,
              enrollmentNo: `ENR${Math.floor(Math.random() * 10000)}`, // Generate a random enrollment number
              name: username,
              dob: new Date(), // This should be collected from the form
              personalEmail: email,
              phoneNo: "",
              studentAvatar: null,
              abcId: null,
              lastCollegeAttended: null,
              batchYearId: batchYear.id,
              admissionYearId: admissionYear.id,
              academicYearId: academicYear.id,
              termId: semester.id,
              gender: "NOT_SPECIFIED", // This should be collected from the form
              isLocalStudent: false,
              isDifferentlyAbled: false,
              motherName: "",
              fatherName: "",
              bloodGroup: null,
              religion: null,
              nationality: null,
              caste: null,
              admissionCategory: null,
              resident: null,
              admissionDate: new Date(),
              graduateDate: null,
              permanentAddress: "",
              permanentCountry: "",
              permanentState: "",
              permanentCity: "",
              permanentPincode: "",
              guardianName: "",
              guardianGender: "",
              guardianEmail: null,
              guardianMobileNo: "",
              guardianRelation: "",
              programId: program.id,
              collegeId: session.user.collegeId,
              departmentId: departmentId,
            },
          });
          break;

        case "ALUMNUS":
          if (!departmentId) {
            throw new Error("Department ID is required for alumnus creation");
          }

          // Get the batch year and admission year for alumnus
          const alumnusBatchYear = await prisma.batchYear.findFirst({
            where: { collegeId: session.user.collegeId },
            orderBy: { year: "desc" },
          });

          const alumnusAdmissionYear = await prisma.admissionYear.findFirst({
            where: { collegeId: session.user.collegeId },
            orderBy: { year: "desc" },
          });

          const alumnusProgram = await prisma.program.findFirst({
            where: { departmentId: departmentId },
          });

          if (!alumnusBatchYear || !alumnusAdmissionYear || !alumnusProgram) {
            await prisma.user.delete({ where: { id: newUser.id } });
            return NextResponse.json(
              { message: "Required academic data not found for alumnus" },
              { status: 400 }
            );
          }

          await prisma.alumnus.create({
            data: {
              userId: newUser.id,
              name: username,
              phoneNo: null,
              dateOfBirth: null,
              address: null,
              departmentId: departmentId,
              programId: alumnusProgram.id,
              batchYearId: alumnusBatchYear.id,
              admissionYearId: alumnusAdmissionYear.id,
              graduationYear: new Date().getFullYear(),
              gpa: null,
              jobStatus: null,
              currentEmployer: null,
              currentPosition: null,
              industry: null,
              linkedInProfile: null,
              achievements: null,
              verified: false,
            },
          });
          break;
      }

      return newUser;
    });

    if ("password" in user) {
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(
        { message: "User created successfully", user: userWithoutPassword },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
