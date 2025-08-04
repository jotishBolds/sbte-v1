//File : /api/loadBalancing/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { extractS3KeyFromUrl } from "@/lib/s3-utils";

const prisma = new PrismaClient();

// Configure AWS S3 client
const createS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;

    if (userRole !== "HOD" && userRole !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to delete this file." },
        { status: 403 }
      );
    }

    const loadBalancingId = params.id;

    if (!loadBalancingId) {
      return NextResponse.json(
        { error: "LoadBalancing ID is required." },
        { status: 400 }
      );
    }

    const loadBalancingPdf = await prisma.loadBalancingPdf.findUnique({
      where: { id: loadBalancingId },
    });

    if (!loadBalancingPdf) {
      return NextResponse.json(
        { error: "LoadBalancing file not found." },
        { status: 404 }
      );
    }

    const s3Client = createS3Client();

    // Handle both legacy URL format and new key format
    let s3Key: string;
    if (loadBalancingPdf.pdfPath.startsWith("http")) {
      // Legacy format: full URL stored
      s3Key = extractS3KeyFromUrl(loadBalancingPdf.pdfPath);
    } else {
      // New format: just the key stored
      s3Key = loadBalancingPdf.pdfPath;
    }

    console.log("Attempting to delete S3 key:", s3Key);

    // Delete the file from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
    };

    try {
      await s3Client.send(new DeleteObjectCommand(deleteParams));
      console.log("Successfully deleted file from S3:", s3Key);
    } catch (s3Error) {
      console.error("S3 delete error for key:", s3Key, s3Error);
      // Continue with database deletion even if S3 delete fails
    }

    // Delete the record from the database
    await prisma.loadBalancingPdf.delete({
      where: { id: loadBalancingId },
    });

    return NextResponse.json({
      message: "LoadBalancing file deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting LoadBalancing file:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      userRole !== "HOD"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to access this file." },
        { status: 403 }
      );
    }

    const loadBalancingId = params.id;

    const loadBalancingPdf = await prisma.loadBalancingPdf.findUnique({
      where: { id: loadBalancingId },
      include: { college: true },
    });

    if (!loadBalancingPdf) {
      return NextResponse.json(
        { error: "LoadBalancing file not found." },
        { status: 404 }
      );
    }

    if (
      (userRole === "COLLEGE_SUPER_ADMIN" || userRole === "HOD") &&
      loadBalancingPdf.collegeId !== userCollegeId
    ) {
      return NextResponse.json(
        { error: "You are not authorized to access this file." },
        { status: 403 }
      );
    }

    const s3Client = createS3Client();

    // Handle both legacy URL format and new key format
    let s3Key: string;
    if (loadBalancingPdf.pdfPath.startsWith("http")) {
      // Legacy format: full URL stored
      s3Key = extractS3KeyFromUrl(loadBalancingPdf.pdfPath);
    } else {
      // New format: just the key stored
      s3Key = loadBalancingPdf.pdfPath;
    }

    console.log("Attempting to download S3 key:", s3Key);

    // Fetch the file from S3
    const getParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
    };

    try {
      const { Body } = await s3Client.send(new GetObjectCommand(getParams));

      if (!Body) {
        console.error("No file body returned from S3 for key:", s3Key);
        return NextResponse.json(
          { error: "File not found on S3." },
          { status: 404 }
        );
      }

      // Convert the file stream to a buffer
      const fileBuffer = await streamToBuffer(Body);

      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${loadBalancingPdf.title}.pdf"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    } catch (s3Error) {
      console.error("S3 download error for key:", s3Key, s3Error);
      return NextResponse.json(
        {
          error: "Failed to download file from S3.",
          details: s3Error instanceof Error ? s3Error.message : String(s3Error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching LoadBalancing file:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// Helper function to convert a stream to a buffer
const streamToBuffer = (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};
