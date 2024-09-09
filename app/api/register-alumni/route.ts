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
  phoneNo: z.string().min(10).max(15),
  dateOfBirth: z.string(),
  address: z.string().min(5).max(255),
  departmentId: z.string(),
  batchYear: z.number().int().min(1900).max(new Date().getFullYear()),
  graduationYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 5),
  gpa: z.number().min(0).max(4).optional(),
  jobStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentPosition: z.string().optional(),
  industry: z.string().optional(),
  linkedInProfile: z.string().url().optional(),
  achievements: z.string().optional(),
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

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: validatedData.departmentId },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create new user and alumnus
    const newUser = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: "ALUMNUS",
        alumnus: {
          create: {
            name: validatedData.name,
            phoneNo: validatedData.phoneNo,
            dateOfBirth: new Date(validatedData.dateOfBirth),
            address: validatedData.address,
            departmentId: validatedData.departmentId,
            batchYear: validatedData.batchYear,
            graduationYear: validatedData.graduationYear,
            gpa: validatedData.gpa,
            jobStatus: validatedData.jobStatus,
            currentEmployer: validatedData.currentEmployer,
            currentPosition: validatedData.currentPosition,
            industry: validatedData.industry,
            linkedInProfile: validatedData.linkedInProfile,
            achievements: validatedData.achievements,
            verified: false, // Set to false by default
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
