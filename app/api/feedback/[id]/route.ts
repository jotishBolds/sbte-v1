//File : /api/feedback/[id]/route.ts

// Import necessary modules from Next.js, Prisma, and NextAuth
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feedbackId = params.id;

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required in the route." },
        { status: 400 }
      );
    }

    // Fetch the feedback by ID
    const feedback = await prisma.feedback.findFirst({
      where: { id: feedbackId },
      include: {
        batchSubject: {
          include: { subject: true }, // Include subject details if necessary
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const feedbackId = params.id;

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required in the route." },
        { status: 400 }
      );
    }

    // Check if the feedback exists
    const existingFeedback = await prisma.feedback.findFirst({
      where: { id: feedbackId },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { error: "Feedback not found." },
        { status: 404 }
      );
    }

    // Delete the feedback
    await prisma.feedback.delete({
      where: { id: feedbackId },
    });

    return NextResponse.json(
      { message: "Feedback deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
