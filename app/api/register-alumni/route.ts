// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// import * as z from "zod";

// const prisma = new PrismaClient();

// const registrationSchema = z.object({
//   username: z.string().min(2).max(50),
//   email: z.string().email(),
//   password: z.string().min(8),
//   name: z.string().min(2).max(100),
//   phoneNo: z.string().min(10).max(15),
//   dateOfBirth: z.string(),
//   address: z.string().min(5).max(255),
//   departmentId: z.string(),
//   batchYear: z.number().int().min(1900).max(new Date().getFullYear()),
//   graduationYear: z
//     .number()
//     .int()
//     .min(1900)
//     .max(new Date().getFullYear() + 5),
//   gpa: z.number().min(0).max(10).optional(),
//   jobStatus: z.string().optional(),
//   currentEmployer: z.string().optional(),
//   currentPosition: z.string().optional(),
//   industry: z.string().optional(),
//   // linkedInProfile: z.string().url().optional(),
//   linkedInProfile: z.union([z.string().url(), z.literal("")]).optional(), // Allow empty string or valid URL
//   achievements: z.string().optional(),
// });

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const validatedData = registrationSchema.parse(body);

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email: validatedData.email },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         { error: "User already exists" },
//         { status: 400 }
//       );
//     }

//     // Check if department exists
//     const department = await prisma.department.findUnique({
//       where: { id: validatedData.departmentId },
//     });

//     if (!department) {
//       return NextResponse.json(
//         { error: "Invalid department ID" },
//         { status: 400 }
//       );
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(validatedData.password, 10);

//     // Create new user and alumnus
//     const newUser = await prisma.user.create({
//       data: {
//         username: validatedData.username,
//         email: validatedData.email,
//         password: hashedPassword,
//         role: "ALUMNUS",
//         alumnus: {
//           create: {
//             name: validatedData.name,
//             phoneNo: validatedData.phoneNo,
//             dateOfBirth: new Date(validatedData.dateOfBirth),
//             address: validatedData.address,
//             departmentId: validatedData.departmentId,
//             batchYear: validatedData.batchYear,
//             graduationYear: validatedData.graduationYear,
//             gpa: validatedData.gpa,
//             jobStatus: validatedData.jobStatus || null, // Set to null if empty
//             currentEmployer: validatedData.currentEmployer || null, // Set to null if empty
//             currentPosition: validatedData.currentPosition || null, // Set to null if empty
//             industry: validatedData.industry || null, // Set to null if empty
//             linkedInProfile: validatedData.linkedInProfile || null, // Set to null if empty
//             achievements: validatedData.achievements || null, // Set to null if empty
//             verified: false, // Set to false by default
//           },
//         },
//       },
//       include: {
//         alumnus: true,
//       },
//     });

//     return NextResponse.json(
//       { message: "Alumnus registered successfully", userId: newUser.id },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Registration error:", error);
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: "Validation error", details: error.errors },
//         { status: 400 }
//       );
//     }
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }


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
  programId: z.string(), // Added field
  batchYearId: z.string(), // Added field
  admissionYearId: z.string(), // Added field
  graduationYear: z.number().int().min(1900).max(new Date().getFullYear() + 5),
  gpa: z.number().min(0).max(10).optional(),
  jobStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentPosition: z.string().optional(),
  industry: z.string().optional(),
  linkedInProfile: z.union([z.string().url(), z.literal("")]).optional(),
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

    // Check if department, program, batch year, and admission year exist
    const department = await prisma.department.findUnique({
      where: { id: validatedData.departmentId },
    });
    if (!department) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 });
    }

    const program = await prisma.program.findUnique({
      where: { id: validatedData.programId },
    });
    if (!program) {
      return NextResponse.json({ error: "Invalid program ID" }, { status: 400 });
    }

    const batchYear = await prisma.batchYear.findUnique({
      where: { id: validatedData.batchYearId },
    });
    if (!batchYear) {
      return NextResponse.json({ error: "Invalid batch year ID" }, { status: 400 });
    }

    const admissionYear = await prisma.admissionYear.findUnique({
      where: { id: validatedData.admissionYearId },
    });
    if (!admissionYear) {
      return NextResponse.json({ error: "Invalid admission year ID" }, { status: 400 });
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
            phoneNo: validatedData.phoneNo || null,
            dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
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
