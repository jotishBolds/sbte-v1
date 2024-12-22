//File : api/schedules/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

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

    if (userRole !== "HOD" && userRole !== "COLLEGE_SUPER_ADMIN") {
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

    const pdfFilePath = schedule.pdfPath;

    await prisma.schedules.delete({
      where: { id: scheduleId },
    });

    const uploadDir = path.join(process.cwd(), "uploads", "schedules");
    const absoluteFilePath = path.join(uploadDir, pdfFilePath);

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

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

    const uploadDir = path.join(process.cwd(), "uploads", "schedules");
    const filePath = path.join(uploadDir, schedule.pdfPath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on the server." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${schedule.title}"`,
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
