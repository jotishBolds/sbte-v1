// app/api/register-alumni/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { passwordSchema } from "@/lib/password-validation";

const prisma = new PrismaClient();

const registrationSchema = z
  .object({
    username: z.string().min(2).max(50),
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    name: z.string().min(2).max(100),
    phoneNo: z.string().min(10).max(15).optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().min(5).max(255).optional(),
    departmentId: z.string(),
    programId: z.string(),
    batchYearId: z.string(),
    admissionYearId: z.string(),
    graduationYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 5),
    gpa: z.number().min(0).max(10).optional(),
    jobStatus: z.string().optional(),
    currentEmployer: z.string().optional(),
    currentPosition: z.string().optional(),
    industry: z.string().optional(),
    linkedInProfile: z.union([z.string().url(), z.literal("")]).optional(),
    achievements: z.string().optional(),
    profilePic: z.string().optional(), // Added field
    batchYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .optional(), // Added from frontend
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = registrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Validate related entities...
    const [department, program, batchYear, admissionYear] = await Promise.all([
      prisma.department.findUnique({
        where: { id: validatedData.departmentId },
      }),
      prisma.program.findUnique({ where: { id: validatedData.programId } }),
      prisma.batchYear.findUnique({ where: { id: validatedData.batchYearId } }),
      prisma.admissionYear.findUnique({
        where: { id: validatedData.admissionYearId },
      }),
    ]);

    if (!department || !program || !batchYear || !admissionYear) {
      return NextResponse.json(
        { error: "Invalid reference data" },
        { status: 400 }
      );
    }

    // Hash password with increased security
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const newUser = await prisma.$transaction(async (prisma) => {
      // Create the user
      const user = await prisma.user.create({
        data: {
          username: validatedData.username,
          email: validatedData.email,
          password: hashedPassword,
          role: "ALUMNUS",
        },
      });

      // Create initial password history
      await prisma.passwordHistory.create({
        data: {
          userId: user.id,
          hashedPassword,
        },
      });

      // Create the alumnus profile
      await prisma.alumnus.create({
        data: {
          userId: user.id,
          name: validatedData.name,
          phoneNo: validatedData.phoneNo || null,
          dateOfBirth: validatedData.dateOfBirth
            ? new Date(validatedData.dateOfBirth)
            : null,
          address: validatedData.address || null,
          departmentId: validatedData.departmentId,
          programId: validatedData.programId,
          batchYearId: validatedData.batchYearId,
          admissionYearId: validatedData.admissionYearId,
          graduationYear: validatedData.graduationYear,
          gpa: validatedData.gpa || null,
          jobStatus: validatedData.jobStatus || null,
          currentEmployer: validatedData.currentEmployer || null,
          currentPosition: validatedData.currentPosition || null,
          industry: validatedData.industry || null,
          linkedInProfile: validatedData.linkedInProfile || null,
          achievements: validatedData.achievements || null,
          profilePic: validatedData.profilePic || null,
          verified: false,
        },
      });

      return user;
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        message: "Alumnus registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
