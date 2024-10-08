import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const associateSemesterSchema = z.object({
  semesterId: z.string({ required_error: "Semester ID is required" }),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
  
      const programId = params.id;
  
          // Step 1: Verify that the program exists
    const program = await prisma.program.findUnique({
        where: {
          id: programId,
          department: {
            collegeId,
          },
        },
      });
  
      if (!program) {
        return NextResponse.json({ error: "Program not found for this college" }, { status: 404 });
      }

      const body = await request.json();
      const validationResult = associateSemesterSchema.safeParse(body);
  
      if (!validationResult.success) {
        return NextResponse.json({
          error: "Validation failed",
          details: validationResult.error.format(),
        }, { status: 400 });
      }
  
      const { semesterId } = validationResult.data;
  
      // Verify the semester belongs to the same college
      const semester = await prisma.semester.findUnique({
        where: { id: semesterId, collegeId },
      });
  
      if (!semester) {
        return NextResponse.json({ error: "Invalid semester for this college" }, { status: 400 });
      }
  
      // Check if the semester is already associated with the program
      const existingAssociation = await prisma.semesterProgram.findFirst({
        where: {
          programId,
          semesterId,
        },
      });
  
      if (existingAssociation) {
        return NextResponse.json({
          error: "Semester is already associated with this program",
        }, { status: 409 }); // Conflict error
      }
  
      // Associate the semester with the program
      await prisma.semesterProgram.create({
        data: {
          programId,
          semesterId,
        },
      });
  
      return NextResponse.json({ message: "Semester associated successfully" }, { status: 201 });
    } catch (error) {
      console.error("Error associating semester:", error);
      
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
  
