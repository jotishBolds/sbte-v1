//File : /api/certificateType/route.ts
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

// POST: Create a new CertificateType
export async function POST(request: NextRequest) {
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
    const college = await prisma.college.findFirst({
      where: { id: collegeId },
    });
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const body = await request.json();
    const validationResult = certificateTypeSchema.safeParse(body);

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

    const existingCertificateType = await prisma.certificateType.findFirst({
      where: {
        name: data.name,
        collegeId,
      },
    });

    if (existingCertificateType) {
      return NextResponse.json(
        { error: "Certificate type already exists for this college" },
        { status: 409 }
      );
    }

    const newCertificateType = await prisma.certificateType.create({
      data: {
        ...data,
        collegeId,
      },
    });

    return NextResponse.json(newCertificateType, { status: 201 });
  } catch (error) {
    console.error("Error creating certificate type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET: Retrieve all CertificateTypes for the user's college
export async function GET(request: NextRequest) {
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

    const certificateTypes = await prisma.certificateType.findMany({
      where: { collegeId },
      include: {
        college: {
          select: { name: true },
        },
        certificates: true, // Include the certificates relation
        _count: {
          select: { certificates: true }, // Get the count of certificates
        },
      },
    });

    if (certificateTypes.length < 1) {
      return NextResponse.json([], { status: 200 });
    }

    // Transform the response to include the certificate count
    const transformedTypes = certificateTypes.map((type) => ({
      ...type,
      certificates: type._count.certificates, // Replace certificates array with count
      _count: undefined, // Remove the _count field
    }));

    return NextResponse.json(transformedTypes, { status: 200 });
  } catch (error) {
    console.error("Error fetching certificate types:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
