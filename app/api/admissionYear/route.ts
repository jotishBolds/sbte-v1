import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const admissionYearSchema = z.object({
  year: z
    .number({
      required_error: "Year is required",
    })
    .int()
    .min(1900, "Year must be a valid year")
    .max(2100, "Year must be a valid year"),
  status: z.boolean().optional().default(true),
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
    const validationResult = admissionYearSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { year, status } = validationResult.data;

    // Check if an admission year with the same year already exists
    const existingAdmissionYear = await prisma.admissionYear.findFirst({
      where: { year, collegeId },
    });

    if (existingAdmissionYear) {
      return NextResponse.json(
        { error: "Admission year with the same year already exists" },
        { status: 409 }
      );
    }

    const newAdmissionYear = await prisma.admissionYear.create({
      data: {
        year,
        status,
        collegeId,
      },
    });

    return NextResponse.json(newAdmissionYear, { status: 201 });
  } catch (error) {
    console.error("Error creating admission year:", error);
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
  
      const admissionYears = await prisma.admissionYear.findMany({
        where: {
          collegeId,
        },
        orderBy: {
            year: 'desc', // Sort by year in descending order
          },
      });
  
      return NextResponse.json(admissionYears, { status: 200 });
    } catch (error) {
      console.error("Error fetching admission years:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  