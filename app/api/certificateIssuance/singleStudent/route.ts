//File : /api/certificateIssuance/singleStudent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating Certificate data
const certificateSchema = z.object({
  studentId: z.string({
    required_error: "Student ID is required.",
  }),
  certificateTypeId: z.string({
    required_error: "Certificate Type ID is required.",
  }),
});

// POST: Assign a certificate to a student
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = certificateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { studentId, certificateTypeId } = validationResult.data;

    // Check if the student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: `Student with ID ${studentId} does not exist.` },
        { status: 404 }
      );
    }

    // Check if the certificate type exists
    const certificateType = await prisma.certificateType.findUnique({
      where: { id: certificateTypeId },
    });

    if (!certificateType) {
      return NextResponse.json(
        {
          error: `Certificate type with ID ${certificateTypeId} does not exist.`,
        },
        { status: 404 }
      );
    }

    // Check if the certificate is already assigned to the student
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        studentId,
        certificateTypeId,
      },
    });

    if (existingCertificate) {
      return NextResponse.json(
        {
          error: `Certificate is already assigned to student.`,
        },
        { status: 409 }
      );
    }

    // Create the certificate
    const newCertificate = await prisma.certificate.create({
      data: {
        studentId,
        certificateTypeId,
        issueDate: null,
        paymentStatus: "PENDING", // Assuming "PENDING" is a valid enum value
      },
    });

    return NextResponse.json(newCertificate, { status: 201 });
  } catch (error) {
    console.error("Error assigning certificate:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user?.collegeId;

    if (!collegeId) {
      return NextResponse.json(
        { error: "College ID is missing in the session." },
        { status: 400 }
      );
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        certificateType: {
          collegeId, // Filters certificates by the college ID in the session
        },
      },
      include: {
        certificateType: true,
        student: true,
      },
    });

    // if (certificates.length === 0) {
    //   return NextResponse.json(
    //     { message: "No certificate issuance found for the college" },
    //     { status: 404 }
    //   );
    // }

    return NextResponse.json(certificates, { status: 200 });
  } catch (error) {
    console.error("Error retrieving certificates:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
