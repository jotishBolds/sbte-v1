//api/batch/[id]/subject/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Define the schema for request body validation
const batchSubjectSchema = z.object({
  // batchId: z.string(),
  subjectId: z.string(),
  subjectCode: z.string(),
  subjectTypeId: z.string(),
  classType: z.enum(["PRACTICAL", "THEORY", "BOTH"]),
  creditScore: z.number(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }
    const batchId = params.id;
    const { subjectId, subjectCode, subjectTypeId, classType, creditScore } =
      batchSubjectSchema.parse(await request.json());

    // Check if the batch exists
    const batchExists = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batchExists) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Check if the same subject code has already been assigned to the batch
    const subjectAssignedToBatch = await prisma.batchSubject.findFirst({
      where: {
        batchId,
        subject: {
          code: subjectCode,
        },
      },
    });

    if (subjectAssignedToBatch) {
      return NextResponse.json(
        { error: "Subject with this code is already assigned to the batch" },
        { status: 400 }
      );
    }

    // Find the current subject
    const currentSubject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!currentSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    let updatedSubjectId = subjectId;

    // If the subject code has changed, create a new subject
    if (currentSubject.code !== subjectCode) {
      const collegeId = session.user.collegeId;
      if (!collegeId) {
        return NextResponse.json(
          { error: "User not associated with a college" },
          { status: 400 }
        );
      }
      const createdById = session.user.id;

      // Create new subject with the updated code and details
      const newSubject = await prisma.subject.create({
        data: {
          name: currentSubject.name, // Keep the same name or pass from the request if it's changed
          code: subjectCode, // Updated subject code
          alias: currentSubject.alias, // Retain the same alias
          creditScore: creditScore, // Use the provided credit score
          collegeId: collegeId, // Use collegeId from session
          createdById: createdById,
          updatedById: createdById,
        },
      });

      updatedSubjectId = newSubject.id;
    }

    // Now, handle the BatchSubject creation/updating
    // Check if the BatchSubject already exists for the given batch and subject type
    const existingBatchSubject = await prisma.batchSubject.findFirst({
      where: {
        batchId,
        subjectId: updatedSubjectId,
        subjectTypeId,
      },
    });

    if (existingBatchSubject) {
      // If BatchSubject exists, update the creditScore if necessary
      await prisma.batchSubject.update({
        where: { id: existingBatchSubject.id },
        data: { creditScore, classType },
      });
    } else {
      // If BatchSubject does not exist, create a new one
      await prisma.batchSubject.create({
        data: {
          batchId,
          subjectId: updatedSubjectId,
          subjectTypeId,
          creditScore,
          classType,
        },
      });
    }

    return NextResponse.json(
      { message: "BatchSubject associated successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing BatchSubject:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const batchId = params.id;
    if (!batchId) {
      return NextResponse.json(
        { error: "batchId is required" },
        { status: 400 }
      );
    }
    // Check if the batch exists
    const batchExists = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batchExists) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const subjects = await prisma.batchSubject.findMany({
      where: {
        batchId,
      },
      include: {
        subject: true,
        subjectType: true,
      },
    });

    // if (subjects.length === 0) {
    //   return NextResponse.json(
    //     { error: "No subjects found for the specified batch" },
    //     { status: 404 }
    //   );
    // }

    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects for batch:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
