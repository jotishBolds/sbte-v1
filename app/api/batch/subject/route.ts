import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const batchSubjectSchema = z.object({
    batchId: z.string(),
    subjectId: z.string().optional(), // Optional, because a new subject may be created
    subjectName: z.string(),          // Subject name
    subjectCode: z.string(),          // Subject code
    subjectAlias: z.string().optional(), // Subject alias (optional)
    subjectCreditScore: z.number(),   // Credit score for the subject
    subjectTypeId: z.string(),        // Subject type ID
    classType: z.enum(["PRACTICAL", "THEORY", "BOTH"]),
    creditScore: z.number(),          // Credit score specific to batch
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
      const createdById = session.user.id;
  
      const body = await request.json();
      const validationResult = batchSubjectSchema.safeParse(body);
      if (!collegeId) {
        return NextResponse.json({ error: "User not associated with a college" }, { status: 400 });
      }
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validationResult.error.format() },
          { status: 400 }
        );
      }
  
      const {
        batchId,
        subjectId,
        subjectName,
        subjectCode,
        subjectAlias,
        subjectCreditScore,
        subjectTypeId,
        classType,
        creditScore,
      } = validationResult.data;
  
      let subject;
  
      // Check if subjectId is provided
      if (subjectId) {
        // Fetch the existing subject
        subject = await prisma.subject.findUnique({
          where: { id: subjectId },
        });
  
        // If the code is different, create a new subject
        if (subject && subject.code !== subjectCode) {
          subject = await prisma.subject.create({
            data: {
              name: subjectName,
              code: subjectCode,
              alias: subjectAlias,
              creditScore: subjectCreditScore,
              collegeId, // Ensure this is a string and defined
              createdById,
              updatedById: createdById,
            },
          });
        }
      } else {
        // Create a new subject if subjectId is not provided
        subject = await prisma.subject.create({
          data: {
            name: subjectName,
            code: subjectCode,
            alias: subjectAlias,
            creditScore: subjectCreditScore,
            collegeId,
            createdById,
            updatedById: createdById,
          },
        });
      }
  
      if (!subject) {
        return NextResponse.json({ error: "Subject not found or created" }, { status: 404 });
      }
  
      // Create the batch subject
      const batchSubject = await prisma.batchSubject.create({
        data: {
          batchId,
          subjectId: subject.id,
          subjectTypeId,
          creditScore, // Store the credit score specific to the batch
          classType,
        },
      });
  
      return NextResponse.json(batchSubject, { status: 201 });
    } catch (error) {
      console.error("Error creating batch subject:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
  