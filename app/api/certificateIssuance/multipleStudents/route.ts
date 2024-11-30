// File: /api/certificateIssuance/multipleStudents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const multipleCertificateSchema = z.object({
  studentIds: z
    .array(z.string())
    .min(1, "At least one Student ID is required."),
  certificateTypeId: z.string({
    required_error: "Certificate Type ID is required.",
  }),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validationResult = multipleCertificateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { studentIds, certificateTypeId } = validationResult.data;

    // Verify certificate type belongs to the correct college
    const certificateType = await prisma.certificateType.findFirst({
      where: {
        id: certificateTypeId,
        collegeId: collegeId,
      },
    });

    if (!certificateType) {
      return NextResponse.json(
        { error: "Invalid certificate type or unauthorized access" },
        { status: 403 }
      );
    }

    // Verify all students exist and belong to the college
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        collegeId: collegeId,
      },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "One or more students not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check for existing certificates
    const existingCertificates = await prisma.certificate.findMany({
      where: {
        studentId: { in: studentIds },
        certificateTypeId,
      },
    });

    const alreadyAssignedStudentIds = existingCertificates.map(
      (cert) => cert.studentId
    );

    // Filter out students who already have the certificate
    const newStudentIds = studentIds.filter(
      (id) => !alreadyAssignedStudentIds.includes(id)
    );

    if (newStudentIds.length === 0) {
      return NextResponse.json(
        {
          message: "All selected students already have this certificate",
          alreadyAssignedStudentIds,
        },
        { status: 200 }
      );
    }

    // Create certificates for new students
    const newCertificates = await prisma.certificate.createMany({
      data: newStudentIds.map((studentId) => ({
        studentId,
        certificateTypeId,
        issueDate: null,
        paymentStatus: "PENDING",
      })),
    });

    return NextResponse.json(
      {
        message: "Certificates assigned successfully",
        created: newCertificates.count,
        alreadyAssignedStudentIds,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning certificates:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
