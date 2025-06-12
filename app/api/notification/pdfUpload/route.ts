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
import { validateAndSanitizeFile } from "@/lib/file-security";

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
  // Outer try-catch for authentication and authorization
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Inner try-catch for file processing and database operations
    try {
      const formData = await request.formData();
      const file = formData.get("pdfFile") as File;
      const title = formData.get("title") as string;
      const collegeIds = JSON.parse(formData.get("collegeIds") as string);

      // Validate and sanitize the uploaded file
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

      // Validate form fields using Zod
      const validation = NotificationSchema.safeParse({ title, collegeIds });
      if (!validation.success) {
        return NextResponse.json(
          {
            errors: validation.error?.errors.map((err) => err.message) || [
              "Invalid input",
            ],
          },
          { status: 400 }
        );
      }

      // Generate unique filename and upload to S3
      const fileName = `notifications/${Date.now()}-${file.name}`;
      const s3Client = createS3Client();
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileName,
        Body: sanitizedBuffer,
        ContentType: "application/pdf",
        ACL: ObjectCannedACL.public_read,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      const pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      // Save notification and create college links
      const notification = await prisma.notification.create({
        data: {
          title,
          pdfPath: pdfUrl,
        },
      });

      type NotificationLink = {
        collegeId: string;
        notificationId: string;
      };

      const notificationLinks: NotificationLink[] = collegeIds.map(
        (collegeId: string) => ({
          collegeId,
          notificationId: notification.id,
        })
      );

      await prisma.$transaction(
        notificationLinks.map((link: NotificationLink) =>
          prisma.notifiedCollege.create({ data: link })
        )
      );

      return NextResponse.json(
        { message: "Notification uploaded successfully.", notification },
        { status: 201 }
      );
    } catch (innerError) {
      console.error("Error processing upload:", innerError);
      return NextResponse.json(
        { error: "An error occurred while processing the upload." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error uploading notification:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while uploading notification." },
      { status: 500 }
    );
  }
}
