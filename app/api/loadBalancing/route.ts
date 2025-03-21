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

const prisma = new PrismaClient();

const LoadBalancingPdfSchema = z.object({
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
    const uniqueFilename = `load-balancing/${uuidv4()}.${fileExtension}`;

    // S3 upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFilename,
      Body: fileBuffer,
      ContentType: file.type,
      ACL: ObjectCannedACL.public_read,
    };

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Construct public URL
    const pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;

    // Save load balancing PDF in the database
    const loadBalancingPdf = await prisma.loadBalancingPdf.create({
      data: {
        title,
        pdfPath: pdfUrl, // Save full S3 URL
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

    return NextResponse.json(loadBalancingPdfs, { status: 200 });
  } catch (error) {
    console.error("Error fetching load balancing PDFs:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
