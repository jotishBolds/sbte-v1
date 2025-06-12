//File : app/api/colleges/logoUpload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { uploadFileToS3, generateSignedDownloadUrl } from "@/lib/s3-utils";
import { validateAndSanitizeFile } from "@/lib/file-security";

// Helper function to validate file type
function isValidFileType(file: File) {
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  return validTypes.includes(file.type);
}

export async function POST(request: NextRequest) {
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
    } // Use the sanitized buffer

    // Create unique filename
    const fileExtension = file.name.split(".").pop();
    const timestamp = Date.now();
    const uniqueFilename = `college-logos/${abbreviation}-${timestamp}-${uuidv4()}.${fileExtension}`;

    // Upload to S3
    await uploadFileToS3(sanitizedBuffer, uniqueFilename, file.type);

    // Generate signed URL for access
    const logoPath = await generateSignedDownloadUrl(uniqueFilename);

    return NextResponse.json(
      {
        logoPath,
        s3Key: uniqueFilename, // Store this in your database
      },
      { status: 200 }
    );
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
