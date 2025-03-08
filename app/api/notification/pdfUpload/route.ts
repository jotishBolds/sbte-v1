import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
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

    // Generate a unique filename
    const fileName = `notifications/${Date.now()}-${file.name}`;

    // Upload file to S3
    const s3Client = createS3Client();
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: "application/pdf",
      ACL: ObjectCannedACL.public_read,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the full S3 URL
    const pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Save notification in the database with the full URL
    const notification = await prisma.notification.create({
      data: {
        title,
        pdfPath: pdfUrl, // Store the full S3 URL
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
