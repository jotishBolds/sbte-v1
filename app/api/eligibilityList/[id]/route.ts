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

    const eligibilityId = params.id;

    if (!eligibilityId) {
      return NextResponse.json(
        { error: "Eligibility ID is required." },
        { status: 400 }
      );
    }

    const eligibility = await prisma.eligibility.findUnique({
      where: { id: eligibilityId },
    });

    if (!eligibility) {
      return NextResponse.json(
        { error: "Eligibility file not found." },
        { status: 404 }
      );
    }

    const pdfFilePath = eligibility.pdfPath;

    await prisma.eligibility.delete({
      where: { id: eligibilityId },
    });

    const uploadDir = path.join(process.cwd(), "uploads", "eligibilities");
    const absoluteFilePath = path.join(uploadDir, pdfFilePath);

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

    return NextResponse.json({
      message: "Eligibility file deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting Eligibility file:", error);
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

    const eligibilityId = params.id;

    const eligibility = await prisma.eligibility.findUnique({
      where: { id: eligibilityId },
      include: { college: true },
    });

    if (!eligibility) {
      return NextResponse.json(
        { error: "Eligibility file not found." },
        { status: 404 }
      );
    }

    if (
      (userRole === "COLLEGE_SUPER_ADMIN" || userRole === "HOD") &&
      eligibility.collegeId !== userCollegeId
    ) {
      return NextResponse.json(
        { error: "You are not authorized to download this file." },
        { status: 403 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads", "eligibility");
    const filePath = path.join(uploadDir, eligibility.pdfPath);

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
        "Content-Disposition": `attachment; filename="${eligibility.title}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading Eligibility file:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
