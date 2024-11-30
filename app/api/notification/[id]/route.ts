//File : /api/notification/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

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

    const pdfFilePath = notification.pdfPath;

    // Delete the notification and its associated notifiedColleges records
    await prisma.$transaction([
      prisma.notifiedCollege.deleteMany({
        where: { notificationId },
      }),
      prisma.notification.delete({
        where: { id: notificationId },
      }),
    ]);

    // Delete the PDF file from the server
    const uploadDir = path.join(process.cwd(), "uploads", "notifications");
    const absoluteFilePath = path.join(uploadDir, pdfFilePath);

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath); // Deletes the file
    }

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

    // Rest of the existing download logic...
    const uploadDir = path.join(process.cwd(), "uploads", "notifications");
    const fileName = path.basename(notification.pdfPath);
    const filePath = path.join(uploadDir, fileName);

    // Read and serve the file
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${notification.title}.pdf"`,
        "Content-Length": fileBuffer.length.toString(),
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
