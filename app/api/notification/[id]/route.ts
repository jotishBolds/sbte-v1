import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createS3Client, extractS3KeyFromUrl } from "@/lib/s3-utils";

// Helper function to convert a stream to a buffer
const streamToBuffer = (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
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

    // Extract the S3 key from the stored path
    // Handle both legacy URL format and new key-only format
    let s3Key: string;
    if (notification.pdfPath.startsWith("http")) {
      // Legacy format: full URL stored
      s3Key = extractS3KeyFromUrl(notification.pdfPath);
    } else {
      // New format: just the key stored
      s3Key = notification.pdfPath;
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

    // Extract the S3 key from the stored path
    // The pdfPath might be a full URL or just a key, handle both cases
    let s3Key: string;
    if (notification.pdfPath.startsWith("http")) {
      // Legacy format: full URL stored
      s3Key = extractS3KeyFromUrl(notification.pdfPath);
    } else {
      // New format: just the key stored
      s3Key = notification.pdfPath;
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
          "Content-Disposition": `attachment; filename="${notification.title}.pdf"`,
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
