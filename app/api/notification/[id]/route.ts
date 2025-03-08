import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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

// Helper function to convert a stream to a buffer
const streamToBuffer = (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

// Helper function to extract S3 key from a full URL
const extractS3KeyFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // The pathname will include the leading slash, so remove it
    return urlObj.pathname.substring(1);
  } catch (error) {
    // If URL parsing fails, assume the value is already a key
    return url;
  }
};

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is SBTE Admin
    const userRole = session.user?.role;
    if (userRole !== "SBTE_ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to delete this notification." },
        { status: 403 }
      );
    }

    const notificationId = params.id;

    // Validate the notification ID
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required." },
        { status: 400 }
      );
    }

    // Check if the notification exists and retrieve the PDF file path
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 }
      );
    }

    const s3Client = createS3Client();

    // Extract the S3 key from the full URL
    const s3Key = extractS3KeyFromUrl(notification.pdfPath);

    // Delete the file from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // Delete the notification and its associated notifiedColleges records
    await prisma.$transaction([
      prisma.notifiedCollege.deleteMany({
        where: { notificationId },
      }),
      prisma.notification.delete({
        where: { id: notificationId },
      }),
    ]);

    return NextResponse.json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
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

    const notificationId = params.id;

    // Fetch the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { notifiedColleges: true },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 }
      );
    }

    // Additional database update to mark as read
    if (userRole === "COLLEGE_SUPER_ADMIN") {
      await prisma.notifiedCollege.updateMany({
        where: {
          notificationId: notificationId,
          collegeId: userCollegeId,
        },
        data: {
          isRead: true,
        },
      });
    }

    // For direct URL approach, you can simply redirect to the S3 URL
    // However, if you want to keep your access control and tracking logic,
    // you should still proxy the file through your API

    // Option 1: Redirect to S3 URL (simplest, but loses tracking capabilities)
    // return NextResponse.redirect(notification.pdfPath);

    // Option 2: Proxy the file through your API (keeps your access control)
    const s3Client = createS3Client();

    // Extract the S3 key from the full URL
    const s3Key = extractS3KeyFromUrl(notification.pdfPath);

    // Fetch the file from S3
    const getParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
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
        "Content-Disposition": `attachment; filename="${notification.title}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error downloading notification:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = params.id;
    const userCollegeId = session.user?.collegeId;

    // Mark notification as read for the specific college
    await prisma.notifiedCollege.updateMany({
      where: {
        notificationId: notificationId,
        collegeId: userCollegeId,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
