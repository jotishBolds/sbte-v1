// File: api/eligibilityList/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { generateSignedDownloadUrl } from "@/lib/s3-utils";

const prisma = new PrismaClient();

interface FileValidationOptions {
  maxSizeBytes: number;
  allowedTypes: string[];
}

async function validateAndSanitizeFile(
  file: File,
  options: FileValidationOptions
) {
  if (!file) return { isValid: false, error: "No file provided" };

  if (!options.allowedTypes.includes(file.type)) {
    return { isValid: false, error: "Invalid file type" };
  }

  if (file.size > options.maxSizeBytes) {
    return { isValid: false, error: "File size exceeds limit" };
  }

  const buffer = await file.arrayBuffer();
  return { isValid: true, sanitizedBuffer: Buffer.from(buffer), error: null };
}

const EligibilityPdfSchema = z.object({
  title: z.string().min(1, "Title is required."),
});

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "College ID not found in session." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("pdfFile") as File;
    const title = formData.get("title") as string; // Validate and sanitize the uploaded file
    const { isValid, sanitizedBuffer, error } = await validateAndSanitizeFile(
      file,
      {
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["application/pdf"],
      }
    );

    if (!isValid || !sanitizedBuffer) {
      return NextResponse.json(
        { error: error || "Invalid or missing PDF file." },
        { status: 400 }
      );
    }

    const validation = EligibilityPdfSchema.safeParse({ title });
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }

    const existingPdf = await prisma.eligibility.findFirst({
      where: { title, collegeId },
    });
    if (existingPdf) {
      return NextResponse.json(
        { error: "A PDF with the same title already exists for this college." },
        { status: 400 }
      );
    }

    // Create unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `eligibility/${Date.now()}-${file.name}`;

    // S3 upload parameters - PRIVATE by default for security
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFilename,
      Body: sanitizedBuffer,
      ContentType: file.type,
      // Removed ACL to make files private by default
    };

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Store only the S3 key, not the full URL for security
    const eligibility = await prisma.eligibility.create({
      data: {
        title,
        pdfPath: uniqueFilename, // Store only the key, not the full URL
        collegeId,
      },
    });

    return NextResponse.json(
      {
        message: "Eligibility PDF uploaded successfully.",
        eligibility,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading eligibility PDF:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while uploading the PDF." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;
    const userCollegeId = session.user?.collegeId;

    if (
      userRole !== "SBTE_ADMIN" &&
      userRole !== "COLLEGE_SUPER_ADMIN" &&
      userRole !== "HOD" &&
      userRole !== "TEACHER" &&
      userRole !== "ADM"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let eligibilities;

    if (userRole === "SBTE_ADMIN") {
      eligibilities = await prisma.eligibility.findMany({
        include: {
          college: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else if (
      userRole === "COLLEGE_SUPER_ADMIN" ||
      userRole === "HOD" ||
      userRole === "TEACHER" ||
      userRole === "ADM"
    ) {
      eligibilities = await prisma.eligibility.findMany({
        where: {
          collegeId: userCollegeId,
        },
        include: {
          college: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    if (!eligibilities || eligibilities.length === 0) {
      return NextResponse.json(
        { message: "No eligibility PDFs found." },
        { status: 200 }
      );
    }

    // Transform response to hide S3 URLs for security
    const safeEligibilities = eligibilities.map((eligibility) => ({
      id: eligibility.id,
      title: eligibility.title,
      collegeId: eligibility.collegeId,
      createdAt: eligibility.createdAt,
      updatedAt: eligibility.updatedAt,
      college: eligibility.college,
      // pdfPath is intentionally omitted for security - use download API instead
    }));

    return NextResponse.json(safeEligibilities, { status: 200 });
  } catch (error) {
    console.error("Error fetching eligibility PDFs:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
