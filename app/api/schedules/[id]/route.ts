//File : api/schedules/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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

    if (
      userRole !== "HOD" &&
      userRole !== "COLLEGE_SUPER_ADMIN" &&
      userRole !== "TEACHER"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to delete this schedule." },
        { status: 403 }
      );
    }

    const scheduleId = params.id;

    if (!scheduleId) {
      return NextResponse.json(
        { error: "Schedule ID is required." },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedules.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found." },
        { status: 404 }
      );
    }

    const s3Client = createS3Client();

    // Delete the file from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: schedule.pdfPath.split("/").pop(), // Extract the key from the S3 URL
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // Delete the record from the database
    await prisma.schedules.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({
      message: "Schedule deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
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
      userRole !== "HOD" &&
      userRole !== "TEACHER"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to access this schedule." },
        { status: 403 }
      );
    }

    const scheduleId = params.id;

    const schedule = await prisma.schedules.findUnique({
      where: { id: scheduleId },
      include: { college: true },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found." },
        { status: 404 }
      );
    }

    if (
      (userRole === "COLLEGE_SUPER_ADMIN" || userRole === "HOD") &&
      schedule.collegeId !== userCollegeId
    ) {
      return NextResponse.json(
        { error: "You are not authorized to access this schedule." },
        { status: 403 }
      );
    }

    const s3Client = createS3Client();

    // Fetch the file from S3
    const getParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: schedule.pdfPath.split("/").pop(), // Extract the key from the S3 URL
    };

    const { Body } = await s3Client.send(new GetObjectCommand(getParams));

    if (!Body) {
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
        "Content-Disposition": `attachment; filename="${schedule.title}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error fetching schedule file:", error);
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
