//File : /api/loadBalancing/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Zod schema for form data validation
const LoadBalancingPdfSchema = z.object({
  title: z.string().min(1, "Title is required."),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if (session.user?.role !== "HOD") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

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

    // Save file to the uploads directory
    const uploadDir = path.join(process.cwd(), "uploads", "load-balancing");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const absoluteFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(absoluteFilePath, fileBuffer);

    // Save load balancing PDF in the database
    const loadBalancingPdf = await prisma.loadBalancingPdf.create({
      data: {
        title,
        pdfPath: fileName, // Save relative path
        collegeId, // Derived from the session
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
