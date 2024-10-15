// Import necessary modules from Next.js and Prisma
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a Zod schema for validating Subject data
const subjectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(20, "Code must be less than 20 characters"),
  alias: z.string().optional(),
  creditScore: z.number().min(0, "Credit score must be a positive number"),
  status: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
      const session = await getServerSession(authOptions);

      if (!session) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const collegeId = session.user.collegeId;
      if (!collegeId) {
          return NextResponse.json({ error: "User is not associated with a college" }, { status: 400 });
      }

      const body = await request.json();
      const validationResult = subjectSchema.safeParse(body);

      if (!validationResult.success) {
          return NextResponse.json(
              { error: "Validation failed", details: validationResult.error.format() },
              { status: 400 }
          );
      }

      const data = validationResult.data;

      const existingSubject = await prisma.subject.findFirst({
          where: {
              code: data.code,
              collegeId,
          },
      });

      if (existingSubject) {
          return NextResponse.json({ error: "Subject with this code already exists" }, { status: 409 });
      }

      const newSubject = await prisma.subject.create({
          data: {
              ...data,
              createdById: session.user.id,
              collegeId,
          },
      });

      return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
      console.error("Error creating subject:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
      await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
      const session = await getServerSession(authOptions);

      if (!session) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const collegeId = session.user.collegeId;
      if (!collegeId) {
          return NextResponse.json({ error: "User is not associated with a college" }, { status: 400 });
      }

      const subjects = await prisma.subject.findMany({
          where: { collegeId },
      });

      return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
      console.error("Error fetching subjects:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
      await prisma.$disconnect();
  }
}
