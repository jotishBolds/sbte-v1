import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Zod schema for form data validation
const NotificationSchema = z.object({
  title: z.string().min(1, "Title is required."),
  collegeIds: z
    .array(z.string().min(1))
    .nonempty("At least one college ID is required."),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("pdfFile") as File;
    const title = formData.get("title") as string;
    const collegeIds = JSON.parse(formData.get("collegeIds") as string);

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
    const validation = NotificationSchema.safeParse({ title, collegeIds });
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }

    // Save file to the public/notifications directory
    const uploadDir = path.join(process.cwd(), "uploads", "notifications");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const absoluteFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(absoluteFilePath, fileBuffer);

    // Save notification in the database
    const notification = await prisma.notification.create({
      data: {
        title,
        // Use a path relative to the public folder
        pdfPath: `/notifications/${fileName}`,
      },
    });

    // Define the type for notification links
    type NotificationLink = {
      collegeId: string;
      notificationId: string;
    };
    // Prepare notification links
    const notificationLinks: NotificationLink[] = collegeIds.map(
      (collegeId: string) => ({
        collegeId,
        notificationId: notification.id,
      })
    );

    // Batch database operation
    await prisma.$transaction(
      notificationLinks.map((link: NotificationLink) =>
        prisma.notifiedCollege.create({ data: link })
      )
    );

    return NextResponse.json(
      { message: "Notification uploaded successfully.", notification },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading notification:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while uploading notification." },
      { status: 500 }
    );
  }
}
