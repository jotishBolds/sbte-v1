//File : app/api/student/upload-profile-pic/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { validateAndSanitizeFile } from "@/lib/file-security";

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
    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    } // Validate and sanitize the uploaded file
    const { isValid, sanitizedBuffer, error } = await validateAndSanitizeFile(
      file,
      {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif"],
      }
    );

    if (!isValid || !sanitizedBuffer) {
      return NextResponse.json(
        { error: error || "Invalid or missing image file." },
        { status: 400 }
      );
    } // Use the sanitized buffer directly

    // Create unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `profile-pics/${uuidv4()}.${fileExtension}`;

    // S3 upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!, // Use AWS_BUCKET_NAME consistently
      Key: uniqueFilename,
      Body: sanitizedBuffer,
      ContentType: file.type,
      ACL: ObjectCannedACL.public_read,
    };

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);

    await s3Client.send(command);

    // Construct public URL
    const profilePicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      profilePic: profilePicUrl,
    });
  } catch (error) {
    console.error("Complete Error Details:", error);
    return NextResponse.json(
      {
        error: "Error uploading file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
