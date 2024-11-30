//File : /api/certificateType/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating CertificateType data
const certificateTypeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
});

// PUT method for updating an existing CertificateType
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Retrieve the user's session using NextAuth
    const session = await getServerSession(authOptions);

    // If session is not found, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has the role "COLLEGE_SUPER_ADMIN"
    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the collegeId associated with the user
    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    // Parse the request body and allow partial validation
    const body = await request.json();
    const validationResult = certificateTypeSchema.partial().safeParse(body);

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

    // Check if the CertificateType exists and belongs to the user's college
    const existingCertificateType = await prisma.certificateType.findFirst({
      where: { id: params.id, collegeId },
    });

    if (!existingCertificateType) {
      return NextResponse.json(
        {
          error:
            "Certificate type not found or does not belong to your college",
        },
        { status: 404 }
      );
    }

    // If updating the name, check for duplicates
    if (data.name) {
      const duplicate = await prisma.certificateType.findFirst({
        where: { name: data.name, collegeId, NOT: { id: params.id } },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Certificate type with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update the CertificateType
    const updatedCertificateType = await prisma.certificateType.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedCertificateType, { status: 200 });
  } catch (error) {
    console.error("Error updating certificate type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET method for fetching a specific CertificateType
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const certificateType = await prisma.certificateType.findFirst({
      where: { id: params.id, collegeId },
      include: { certificates: true }, // Include related certificates if needed
    });

    if (!certificateType) {
      return NextResponse.json(
        {
          error:
            "Certificate type not found or does not belong to your college",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(certificateType, { status: 200 });
  } catch (error) {
    console.error("Error fetching certificate type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE method for removing an existing CertificateType
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const existingCertificateType = await prisma.certificateType.findFirst({
      where: { id: params.id, collegeId },
    });

    if (!existingCertificateType) {
      return NextResponse.json(
        { error: "Certificate type not found or not in your college" },
        { status: 404 }
      );
    }

    await prisma.certificateType.delete({ where: { id: params.id } });
    return NextResponse.json(
      { message: "Certificate type deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting certificate type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
