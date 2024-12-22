//File : /api/infrastructures/[id]/route.ts

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
        { error: "You are not authorized to delete this file." },
        { status: 403 }
      );
    }

    const infrastructureId = params.id;

    if (!infrastructureId) {
      return NextResponse.json(
        { error: "Infrastructure ID is required." },
        { status: 400 }
      );
    }

    const infrastructure = await prisma.infrastructures.findUnique({
      where: { id: infrastructureId },
    });

    if (!infrastructure) {
      return NextResponse.json(
        { error: "Infrastructure file not found." },
        { status: 404 }
      );
    }

    const pdfFilePath = infrastructure.pdfPath;

    await prisma.infrastructures.delete({
      where: { id: infrastructureId },
    });

    const uploadDir = path.join(process.cwd(), "uploads", "infrastructures");
    const absoluteFilePath = path.join(uploadDir, pdfFilePath);

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

    return NextResponse.json({
      message: "Infrastructure file deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting Infrastructure file:", error);
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
      userRole !== "HOD"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to download this file." },
        { status: 403 }
      );
    }

    const infrastructureId = params.id;

    const infrastructure = await prisma.infrastructures.findUnique({
      where: { id: infrastructureId },
      include: { college: true },
    });

    if (!infrastructure) {
      return NextResponse.json(
        { error: "Infrastructure file not found." },
        { status: 404 }
      );
    }

    if (
      (userRole === "COLLEGE_SUPER_ADMIN" || userRole === "HOD") &&
      infrastructure.collegeId !== userCollegeId
    ) {
      return NextResponse.json(
        { error: "You are not authorized to download this file." },
        { status: 403 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads", "infrastructures");
    const filePath = path.join(uploadDir, infrastructure.pdfPath);

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
        "Content-Disposition": `attachment; filename="${infrastructure.title}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading Infrastructure file:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
