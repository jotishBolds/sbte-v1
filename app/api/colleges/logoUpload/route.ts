//File  : /api/colleges/logoUpload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Helper function to validate file type
function isValidFileType(file: File) {
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  return validTypes.includes(file.type);
}

// Helper function to ensure upload directory exists
async function ensureUploadDirectory(uploadDir: string) {
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes); // Explicitly create a Buffer

    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${abbreviation}-${timestamp}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

    await ensureUploadDirectory(uploadDir);
    const filePath = path.join(uploadDir, uniqueFilename);

    // Ensure compatibility with writeFile
    await writeFile(filePath, buffer as Uint8Array); // Cast to Uint8Array
    const logoPath = `/uploads/logos/${uniqueFilename}`;

    return NextResponse.json({ logoPath }, { status: 200 });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
