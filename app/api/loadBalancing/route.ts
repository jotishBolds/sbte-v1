//File : /api/loadBalancing/route.ts

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

const LoadBalancingPdfSchema = z.object({
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("pdfFile") as File;
    const title = formData.get("title") as string;

    // Validate PDF file
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid or missing PDF file." },
        { status: 400 }
      );
    }

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 10MB." },
        { status: 400 }
      );
    }

    // Validate fields using Zod
    const validation = LoadBalancingPdfSchema.safeParse({ title });
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }

    // Check for duplicate title in the same college
    const existingPdf = await prisma.loadBalancingPdf.findFirst({
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
    const uniqueFilename = `loadBalancing/${Date.now()}-${file.name}`;

    // S3 upload parameters - PRIVATE by default for security
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFilename,
      Body: fileBuffer,
      ContentType: file.type,
      // Removed ACL to make files private by default
    };

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Save load balancing PDF in the database - Store only S3 key for security
    const loadBalancingPdf = await prisma.loadBalancingPdf.create({
      data: {
        title,
        pdfPath: uniqueFilename, // Store only the key, not the full URL
        collegeId,
      },
    });

    return NextResponse.json(
      {
        message: "Load balancing PDF uploaded successfully.",
        loadBalancingPdf,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading load balancing PDF:", error);
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

    // Check if the role is valid
    if (
      userRole !== "SBTE_ADMIN" &&
      userRole !== "COLLEGE_SUPER_ADMIN" &&
      userRole !== "HOD"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let loadBalancingPdfs;

    if (userRole === "SBTE_ADMIN") {
      // SBTE Admin: Fetch all load balancing PDFs along with their associated college
      loadBalancingPdfs = await prisma.loadBalancingPdf.findMany({
        include: {
          college: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else if (userRole === "COLLEGE_SUPER_ADMIN" || userRole === "HOD") {
      // College Super Admin: Fetch only their college's load balancing PDFs
      loadBalancingPdfs = await prisma.loadBalancingPdf.findMany({
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

    // Return a message if no load balancing PDFs are found
    if (!loadBalancingPdfs || loadBalancingPdfs.length === 0) {
      return NextResponse.json(
        { message: "No load balancing PDFs found." },
        { status: 200 }
      );
    }

    // Transform response to hide S3 URLs for security
    const safeLoadBalancingPdfs = loadBalancingPdfs.map((pdf) => ({
      id: pdf.id,
      title: pdf.title,
      collegeId: pdf.collegeId,
      createdAt: pdf.createdAt,
      updatedAt: pdf.updatedAt,
      college: pdf.college,
      // pdfPath is intentionally omitted for security - use download API instead
    }));

    return NextResponse.json(safeLoadBalancingPdfs, { status: 200 });
  } catch (error) {
    console.error("Error fetching load balancing PDFs:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
