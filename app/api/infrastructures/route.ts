//File : /app/api/infrastructures/route.ts

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
import { validateAndSanitizeFile } from "@/lib/file-security";

const prisma = new PrismaClient();

const InfrastructurePdfSchema = z.object({
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

    const validation = InfrastructurePdfSchema.safeParse({ title });
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }

    const existingInfrastructure = await prisma.infrastructures.findFirst({
      where: { title, collegeId },
    });
    if (existingInfrastructure) {
      return NextResponse.json(
        {
          error:
            "An infrastructure with the same title already exists for this college.",
        },
        { status: 400 }
      );
    }

    // Create unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `infrastructures/${Date.now()}-${file.name}`;

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
    const infrastructure = await prisma.infrastructures.create({
      data: {
        title,
        pdfPath: uniqueFilename, // Store only the key, not the full URL
        collegeId,
      },
    });

    return NextResponse.json(
      {
        message: "Infrastructure PDF uploaded successfully.",
        infrastructure,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading infrastructure PDF:", error);
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
      userRole !== "ADM"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let infrastructures;

    if (userRole === "SBTE_ADMIN") {
      infrastructures = await prisma.infrastructures.findMany({
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
      userRole === "ADM"
    ) {
      infrastructures = await prisma.infrastructures.findMany({
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

    if (!infrastructures || infrastructures.length === 0) {
      return NextResponse.json(
        { message: "No infrastructures found." },
        { status: 200 }
      );
    }

    // Transform response to hide S3 URLs for security
    const safeInfrastructures = infrastructures.map((infrastructure) => ({
      id: infrastructure.id,
      title: infrastructure.title,
      collegeId: infrastructure.collegeId,
      createdAt: infrastructure.createdAt,
      updatedAt: infrastructure.updatedAt,
      college: infrastructure.college,
      // pdfPath is intentionally omitted for security - use download API instead
    }));

    return NextResponse.json(safeInfrastructures, { status: 200 });
  } catch (error) {
    console.error("Error fetching infrastructures:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
