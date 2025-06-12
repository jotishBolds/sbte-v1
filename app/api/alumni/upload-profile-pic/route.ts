//api/alumni/upload-profile-pic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { uploadFileToS3, generateSignedDownloadUrl } from "@/lib/s3-utils";
import { validateAndSanitizeFile } from "@/lib/file-security";

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const alumniId = formData.get("alumniId") as string;

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
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with alumniId if available
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = alumniId
      ? `alumni-profile-pics/${alumniId}-${uuidv4()}.${fileExtension}`
      : `alumni-profile-pics/${uuidv4()}.${fileExtension}`;

    // Upload to S3
    await uploadFileToS3(buffer, uniqueFilename, file.type);

    // Generate signed URL for access
    const profilePicUrl = await generateSignedDownloadUrl(uniqueFilename);

    return NextResponse.json({
      message: "File uploaded successfully",
      profilePic: profilePicUrl,
      s3Key: uniqueFilename, // Store this in your database
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
