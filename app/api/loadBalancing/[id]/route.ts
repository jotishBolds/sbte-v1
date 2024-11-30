//File : /api/loadBalancing/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// DELETE API: Delete LoadBalancingPdf by HOD
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

    // Only HOD can delete LoadBalancingPdf
    if (userRole !== "HOD") {
      return NextResponse.json(
        { error: "You are not authorized to delete this file." },
        { status: 403 }
      );
    }

    const loadBalancingId = params.id;

    if (!loadBalancingId) {
      return NextResponse.json(
        { error: "LoadBalancing ID is required." },
        { status: 400 }
      );
    }

    const loadBalancingPdf = await prisma.loadBalancingPdf.findUnique({
      where: { id: loadBalancingId },
    });

    if (!loadBalancingPdf) {
      return NextResponse.json(
        { error: "LoadBalancing file not found." },
        { status: 404 }
      );
    }

    const pdfFilePath = loadBalancingPdf.pdfPath;

    await prisma.loadBalancingPdf.delete({
      where: { id: loadBalancingId },
    });

    const uploadDir = path.join(process.cwd(), "uploads", "loadBalancing");
    const absoluteFilePath = path.join(uploadDir, pdfFilePath);

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath); // Deletes the file
    }

    return NextResponse.json({
      message: "LoadBalancing file deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting LoadBalancing file:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// GET API: Download LoadBalancingPdf by authorized roles
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

    // Only authorized roles can download LoadBalancingPdf
    if (
      !["HOD", "SBTE_ADMIN", "COLLEGE_SUPER_ADMIN"].includes(userRole || "")
    ) {
      return NextResponse.json(
        { error: "You are not authorized to download this file." },
        { status: 403 }
      );
    }

    const loadBalancingId = params.id;

    const loadBalancingPdf = await prisma.loadBalancingPdf.findUnique({
      where: { id: loadBalancingId },
      include: { college: true },
    });

    if (!loadBalancingPdf) {
      return NextResponse.json(
        { error: "LoadBalancing file not found." },
        { status: 404 }
      );
    }

    // If COLLEGE_SUPER_ADMIN, ensure the file belongs to their college
    if (
      (userRole === "COLLEGE_SUPER_ADMIN" || userRole === "HOD") &&
      loadBalancingPdf.collegeId !== userCollegeId
    ) {
      return NextResponse.json(
        { error: "You are not authorized to download this file." },
        { status: 403 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads", "load-balancing");
    const filePath = path.join(uploadDir, loadBalancingPdf.pdfPath);

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
        "Content-Disposition": `attachment; filename="${loadBalancingPdf.title}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading LoadBalancing file:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
