//File : /api/infrastructures/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const InfrastructurePdfSchema = z.object({
  title: z.string().min(1, "Title is required."),
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

    const formData = await request.formData();
    const file = formData.get("pdfFile") as File;
    const title = formData.get("title") as string;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid or missing PDF file." },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 10MB." },
        { status: 400 }
      );
    }

    const validation = InfrastructurePdfSchema.safeParse({ title });
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }

    const existingPdf = await prisma.infrastructures.findFirst({
      where: { title, collegeId },
    });
    if (existingPdf) {
      return NextResponse.json(
        { error: "A PDF with the same title already exists for this college." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads", "infrastructures");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const absoluteFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(absoluteFilePath, new Uint8Array(fileBuffer));

    const infrastructures = await prisma.infrastructures.create({
      data: {
        title,
        pdfPath: fileName,
        collegeId,
      },
    });

    return NextResponse.json(
      {
        message: "Infrastructure PDF uploaded successfully.",
        infrastructures,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading infrastructure PDF:", error);
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

    if (
      userRole !== "SBTE_ADMIN" &&
      userRole !== "COLLEGE_SUPER_ADMIN" &&
      userRole !== "HOD"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let infrastructures;

    if (userRole === "SBTE_ADMIN") {
      infrastructures = await prisma.infrastructures.findMany({
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
      infrastructures = await prisma.infrastructures.findMany({
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

    // if (!infrastructures || infrastructures.length === 0) {
    //   return NextResponse.json(
    //     { message: "No infrastructure PDFs found." },
    //     { status: 200 }
    //   );
    // }

    return NextResponse.json(infrastructures, { status: 200 });
  } catch (error) {
    console.error("Error fetching infrastructure PDFs:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
