//File : api/schedules/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const SchedulePdfSchema = z.object({
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

    const validation = SchedulePdfSchema.safeParse({ title });
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }

    const existingSchedule = await prisma.schedules.findFirst({
      where: { title, collegeId },
    });
    if (existingSchedule) {
      return NextResponse.json(
        {
          error:
            "A schedule with the same title already exists for this college.",
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads", "schedules");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const absoluteFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(absoluteFilePath, new Uint8Array(fileBuffer));

    const schedule = await prisma.schedules.create({
      data: {
        title,
        pdfPath: fileName,
        collegeId,
      },
    });

    return NextResponse.json(
      {
        message: "Schedule PDF uploaded successfully.",
        schedule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading schedule PDF:", error);
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
      userRole !== "HOD" &&
      userRole !== "TEACHER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let schedules;

    if (userRole === "SBTE_ADMIN") {
      schedules = await prisma.schedules.findMany({
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
      schedules = await prisma.schedules.findMany({
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

    if (!schedules || schedules.length === 0) {
      return NextResponse.json(
        { message: "No schedules found." },
        { status: 200 }
      );
    }

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
