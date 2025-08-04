import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth";
import { uploadFileToS3, generateSignedDownloadUrl } from "@/lib/s3-utils";
import {
  logAuditEvent,
  logSecurityEvent,
  getClientInfoFromNextRequest,
} from "@/lib/audit-logger";
import { nanoid } from "nanoid";
import * as z from "zod";

// File validation configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  "image/jpeg": { ext: [".jpg", ".jpeg"], maxSize: 5 * 1024 * 1024 },
  "image/png": { ext: [".png"], maxSize: 5 * 1024 * 1024 },
  "image/gif": { ext: [".gif"], maxSize: 2 * 1024 * 1024 },
  "application/pdf": { ext: [".pdf"], maxSize: 10 * 1024 * 1024 },
  "application/msword": { ext: [".doc"], maxSize: 5 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    ext: [".docx"],
    maxSize: 5 * 1024 * 1024,
  },
  "application/vnd.ms-excel": { ext: [".xls"], maxSize: 5 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    ext: [".xlsx"],
    maxSize: 5 * 1024 * 1024,
  },
};

// Malware scanning patterns (basic implementation)
const MALWARE_SIGNATURES = [
  // Basic suspicious patterns
  /\x4d\x5a/i, // PE executable header
  /\x7f\x45\x4c\x46/i, // ELF executable header
  /<script[^>]*>/i, // Script tags
  /javascript:/i, // JavaScript protocol
  /vbscript:/i, // VBScript protocol
  /onload=/i, // Event handlers
  /onerror=/i,
  /onclick=/i,
  /eval\(/i, // JavaScript eval
  /document\.write/i, // Document manipulation
  /window\.location/i, // Location manipulation
];

// Input validation schema
const uploadSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid filename format"),
  purpose: z.enum([
    "profile",
    "document",
    "certificate",
    "notification",
    "infrastructure",
  ]),
  metadata: z
    .object({
      description: z.string().optional(),
      category: z.string().optional(),
    })
    .optional(),
});

// File type validation
function fileTypeValidation(file: File): { valid: boolean; error?: string } {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Check if file type is allowed
  if (!ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES]) {
    return { valid: false, error: "File type not allowed" };
  }

  const typeConfig =
    ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];

  // Check file extension matches MIME type
  const hasValidExtension = typeConfig.ext.some((ext) =>
    fileName.endsWith(ext)
  );
  if (!hasValidExtension) {
    return { valid: false, error: "File extension does not match MIME type" };
  }

  // Check file size
  if (file.size > typeConfig.maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit (${typeConfig.maxSize / 1024 / 1024}MB)`,
    };
  }

  return { valid: true };
}

// Basic malware scanning
async function scanForMalware(
  fileBuffer: ArrayBuffer
): Promise<{ clean: boolean; threats?: string[] }> {
  const uint8Array = new Uint8Array(fileBuffer);
  const fileContent = Array.from(uint8Array)
    .map((byte) => String.fromCharCode(byte))
    .join("");

  const threats: string[] = [];

  // Check against malware signatures
  for (const signature of MALWARE_SIGNATURES) {
    if (signature.test(fileContent)) {
      threats.push(`Suspicious pattern detected: ${signature.source}`);
    }
  }

  // Additional checks for specific file types
  if (fileContent.includes("<?php")) threats.push("PHP code detected");
  if (fileContent.includes("<%")) threats.push("Server-side script detected");
  if (fileContent.includes("#!/bin/")) threats.push("Shell script detected");

  return {
    clean: threats.length === 0,
    threats: threats.length > 0 ? threats : undefined,
  };
}

// Sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ipAddress, userAgent } = getClientInfoFromNextRequest(request);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const purpose = formData.get("purpose") as string;
    const metadata = formData.get("metadata")
      ? JSON.parse(formData.get("metadata") as string)
      : {};

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate input
    const validationResult = uploadSchema.safeParse({
      filename: file.name,
      purpose,
      metadata,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // File type validation
    const typeValidation = fileTypeValidation(file);
    if (!typeValidation.valid) {
      await logSecurityEvent({
        eventType: "MALICIOUS_FILE_UPLOAD_ATTEMPT",
        userId: session.user.id,
        userEmail: session.user.email || "",
        ipAddress,
        userAgent,
        details: `Invalid file type: ${typeValidation.error}`,
        severity: "MEDIUM",
      });

      return NextResponse.json(
        { error: typeValidation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer and scan for malware
    const fileBuffer = await file.arrayBuffer();
    const malwareScan = await scanForMalware(fileBuffer);

    if (!malwareScan.clean) {
      await logSecurityEvent({
        eventType: "MALWARE_UPLOAD_ATTEMPT",
        userId: session.user.id,
        userEmail: session.user.email || "",
        ipAddress,
        userAgent,
        details: `Malware detected: ${malwareScan.threats?.join(", ")}`,
        severity: "HIGH",
      });

      return NextResponse.json(
        { error: "File failed security scan", threats: malwareScan.threats },
        { status: 400 }
      );
    }

    // Generate secure filename
    const sanitizedFilename = sanitizeFilename(file.name);
    const fileExtension = sanitizedFilename.split(".").pop();
    const secureKey = `${purpose}/${session.user.id}/${nanoid(
      16
    )}.${fileExtension}`;

    // Upload to S3 (private by default)
    const uploadKey = await uploadFileToS3(
      Buffer.from(fileBuffer),
      secureKey,
      file.type
    );

    // Generate signed URL for access
    const signedUrl = await generateSignedDownloadUrl(uploadKey);

    // Log successful upload
    await logAuditEvent({
      userId: session.user.id,
      userEmail: session.user.email || "",
      action: "FILE_UPLOAD",
      resource: "FILE_STORAGE",
      details: `File uploaded: ${sanitizedFilename} (${file.size} bytes)`,
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      fileKey: uploadKey,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    });
  } catch (error) {
    console.error("File upload error:", error);

    // Log the error
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const { ipAddress, userAgent } = getClientInfoFromNextRequest(request);
      await logSecurityEvent({
        eventType: "FILE_UPLOAD_ERROR",
        userId: session.user.id,
        userEmail: session.user.email || "",
        ipAddress,
        userAgent,
        details: `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        severity: "LOW",
      });
    }

    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}

// GET method for retrieving file information
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get("key");

    if (!fileKey) {
      return NextResponse.json({ error: "File key required" }, { status: 400 });
    }

    // Generate new signed URL
    const signedUrl = await generateSignedDownloadUrl(fileKey);

    return NextResponse.json({
      url: signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    });
  } catch (error) {
    console.error("File retrieval error:", error);
    return NextResponse.json(
      { error: "File retrieval failed" },
      { status: 500 }
    );
  }
}
