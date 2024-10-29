// app/api/register-alumni/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as z from "zod";

const prisma = new PrismaClient();

const registrationSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
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
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registrationSchema.parse(body);

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

    // Hash password and create user with alumnus
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: "ALUMNUS",
        alumnus: {
          create: {
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
        },
      },
      include: {
        alumnus: true,
      },
    });

    return NextResponse.json(
      { message: "Alumnus registered successfully", userId: newUser.id },
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
