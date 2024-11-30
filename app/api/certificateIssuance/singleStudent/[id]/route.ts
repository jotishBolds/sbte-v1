//File : /api/certificateIssuance/singleStudent/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

const PaymentStatus = z.enum(["PENDING", "COMPLETED", "FAILED"]);
const certificateUpdateSchema = z.object({
  issueDate: z.coerce.date().optional(),
  paymentStatus: PaymentStatus.optional(), // Use the enum for validation
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        id: params.id,
        certificateType: { collegeId },
      },
      include: {
        certificateType: true,
        student: true,
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found or does not belong to your college" },
        { status: 404 }
      );
    }

    return NextResponse.json(certificate, { status: 200 });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body with Zod
    const validationResult = certificateUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        id: params.id,
        certificateType: { collegeId },
      },
    });

    if (!existingCertificate) {
      return NextResponse.json(
        { error: "Certificate not found or does not belong to your college" },
        { status: 404 }
      );
    }

    const updatedCertificate = await prisma.certificate.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedCertificate, { status: 200 });
  } catch (error) {
    console.error("Error updating certificate:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        id: params.id,
        certificateType: { collegeId },
      },
    });

    if (!existingCertificate) {
      return NextResponse.json(
        { error: "Certificate not found or does not belong to your college" },
        { status: 404 }
      );
    }

    await prisma.certificate.delete({ where: { id: params.id } });

    return NextResponse.json(
      { message: "Certificate deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
