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
      .max(2100, "Year must be a valid year")
      .optional(), // Make year optional
    status: z.boolean().optional().default(true), // Status remains optional
  });

export async function PUT(
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
  
      const collegeId = session.user.collegeId;
      if (!collegeId) {
        return NextResponse.json({ error: "User is not associated with a college" }, { status: 400 });
      }
  
      const body = await request.json();
      const validationResult = admissionYearSchema.partial().safeParse(body);
  
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validationResult.error.format() },
          { status: 400 }
        );
      }
  
      const data = validationResult.data;
  
      // Fetch existing admission year to ensure it belongs to the user's college
      const existingAdmissionYear = await prisma.admissionYear.findFirst({
        where: {
          id: params.id,
          collegeId,
        },
      });
  
      if (!existingAdmissionYear) {
        return NextResponse.json({ error: "Admission year not found" }, { status: 404 });
      }
  
      // If updating the year, ensure it's unique within the college
      if (data.year) {
        const duplicateYear = await prisma.admissionYear.findFirst({
          where: {
            year: data.year,
            collegeId,
            NOT: {
              id: params.id, // Exclude the current record from the check
            },
          },
        });
  
        if (duplicateYear) {
          return NextResponse.json({ error: "Admission year already exists for this college" }, { status: 409 });
        }
      }
  
      const updatedAdmissionYear = await prisma.admissionYear.update({
        where: { id: params.id },
        data: {
          ...data,
        },
      });
  
      return NextResponse.json(updatedAdmissionYear, { status: 200 });
    } catch (error) {
      console.error("Error updating admission year:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
  
      const collegeId = session.user.collegeId;
      if (!collegeId) {
        return NextResponse.json({ error: "User is not associated with a college" }, { status: 400 });
      }
  
      const existingAdmissionYear = await prisma.admissionYear.findUnique({
        where: { id: params.id },
      });
  
      if (!existingAdmissionYear || existingAdmissionYear.collegeId !== collegeId) {
        return NextResponse.json({ error: "Admission year not found" }, { status: 404 });
      }
  
      await prisma.admissionYear.delete({
        where: { id: params.id },
      });
  
      return NextResponse.json({ message: "Admission year deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting admission year:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  