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

// Validate environment variables
function validateEnvVariables() {
  const requiredVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_BUCKET_NAME",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

// Configure AWS S3 client
const createS3Client = () => {
  try {
    validateEnvVariables();

    return new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  } catch (error) {
    console.error("S3 Client Configuration Error:", error);
    throw error;
  }
};

export async function POST(request: Request) {
  let s3Client: S3Client;
  try {
    s3Client = createS3Client();
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to initialize S3 Client",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }

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
    const uniqueFilename = `eligibility-pdfs/${uuidv4()}.${fileExtension}`;

    // S3 upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFilename,
      Body: sanitizedBuffer,
      ContentType: file.type,
      ACL: ObjectCannedACL.public_read,
    };

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Construct public URL
    const pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;

    const eligibility = await prisma.eligibility.create({
      data: {
        title,
        pdfPath: pdfUrl,
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
      userRole !== "TEACHER"
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
      userRole === "TEACHER"
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

    return NextResponse.json(eligibilities, { status: 200 });
  } catch (error) {
    console.error("Error fetching eligibility PDFs:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
