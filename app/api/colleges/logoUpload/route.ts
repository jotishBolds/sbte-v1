//File : app/api/colleges/logoUpload/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

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

// Helper function to validate file type
function isValidFileType(file: File) {
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  return validTypes.includes(file.type);
}

export async function POST(request: NextRequest) {
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
    const formData = await request.formData();

    const file = formData.get("logo") as File;
    const abbreviation = formData.get("abbreviation") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Please upload a logo file." },
        { status: 400 }
      );
    }

    if (!abbreviation || typeof abbreviation !== "string") {
      return NextResponse.json(
        { error: "Abbreviation is required and must be a string." },
        { status: 400 }
      );
    }

    if (!isValidFileType(file)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image file." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Get file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = file.name.split(".").pop();
    const timestamp = Date.now();
    const uniqueFilename = `college-logos/${abbreviation}-${timestamp}-${uuidv4()}.${fileExtension}`;

    // S3 upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: file.type,
      ACL: ObjectCannedACL.public_read,
    };

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Construct public URL
    const logoPath = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;

    return NextResponse.json({ logoPath }, { status: 200 });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
