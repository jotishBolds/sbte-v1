// api/student/upload-profile-pic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Helper function to validate file type
function isValidFileType(file: File) {
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  return validTypes.includes(file.type);
}

// Helper function to ensure upload directory exists
async function ensureUploadDirectory(uploadDir: string) {
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // Directory already exists or error creating it
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!isValidFileType(file)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image file." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Get the file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;

    // Define the upload directory path
    const uploadDir = path.join(process.cwd(), "public", "students-images");

    // Ensure the uploads directory exists
    await ensureUploadDirectory(uploadDir);

    const filePath = path.join(uploadDir, uniqueFilename);

    // Write the file
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: "File uploaded successfully",
      profilePic: `/students-images/${uniqueFilename}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
