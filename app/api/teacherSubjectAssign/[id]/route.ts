// api/teacherSubjectAssign/[id]/route.ts

// Required imports for Prisma (database), authentication, and validation
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient(); // Initialize Prisma client

// Validation schema for the subjects being assigned
const assignSubjectsSchema = z.object({
  subjectIds: z.array(z.string()), // Ensure subjectIds is an array of strings
});

// POST request to assign subjects to a specific teacher
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } } // 'id' refers to teacherId
) {
  try {
    // Get the current session (check if the user is authenticated)
    const session = await getServerSession(authOptions);

    // If no session is found, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only users with the role of "HOD" are allowed to perform this action
    if (session.user?.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teacherId = params.id; // Get teacherId from dynamic route
    const body = await request.json(); // Parse the request body

    // Validate the request body with Zod schema
    const validationResult = assignSubjectsSchema.safeParse(body);
    if (!validationResult.success) {
      // Return a validation error if the body is not valid
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { subjectIds } = validationResult.data; // Extract subjectIds from the validated data

    // Check if the teacher exists in the database
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      // If the teacher doesn't exist, return a 404 error
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Fetch any subjects that are already assigned to the teacher
    const alreadyAssignedSubjects =
      await prisma.teacherAssignedSubject.findMany({
        where: {
          teacherId,
          batchSubjectId: {
            in: subjectIds, // Check if any of the subjects passed are already assigned
          },
        },
      });

    // Get the IDs of subjects that are already assigned
    const alreadyAssignedSubjectIds = alreadyAssignedSubjects.map(
      (assignment) => assignment.batchSubjectId
    );

    // Filter the subjects that haven't been assigned yet
    const subjectsToAssign = subjectIds.filter(
      (subjectId) => !alreadyAssignedSubjectIds.includes(subjectId)
    );

    if (subjectsToAssign.length === 0) {
      // If all subjects are already assigned, return a message indicating this
      return NextResponse.json(
        {
          message:
            "All selected subjects have already been assigned to the teacher",
        },
        { status: 400 }
      );
    }

    // Assign the remaining (unassigned) subjects to the teacher
    const assignedSubjects = await Promise.all(
      subjectsToAssign.map(async (subjectId) => {
        // Check if the subject exists in the database
        const existingSubject = await prisma.batchSubject.findUnique({
          where: { id: subjectId },
        });

        if (!existingSubject) {
          // Throw an error if the subject doesn't exist
          throw new Error(`Subject with ID ${subjectId} not found`);
        }

        // Create a new assignment record for the teacher and subject
        return prisma.teacherAssignedSubject.create({
          data: {
            teacherId,
            batchSubjectId: subjectId,
          },
        });
      })
    );

    // Return a success response with the assigned subjects and any already assigned subjects
    return NextResponse.json(
      {
        message: "Subjects assigned successfully",
        data: assignedSubjects,
        skippedSubjects: alreadyAssignedSubjectIds, // Subjects that were already assigned
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch any errors and return a 500 Internal Server Error response
    console.error("Error assigning subjects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Ensure Prisma client is disconnected
  }
}

// GET request to fetch all subjects assigned to a specific teacher
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions); // Fetch the session for authentication

    // If no session, return an Unauthorized error
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = params.id; // Get teacherId from the dynamic route

    // Check if the teacher exists in the database
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      // If teacher doesn't exist, return a 404 error
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Fetch all the subjects that are assigned to the teacher
    const assignedSubjects = await prisma.teacherAssignedSubject.findMany({
      where: {
        teacherId,
      },
      include: {
        batchSubject: {
          include: {
            subject: true, // Include the subject details
            subjectType: true, // Include subject type details
            batch: true, // Include batch details
          },
        },
      },
    });

    if (assignedSubjects.length === 0) {
      // If no subjects are found, return a 404 error with a message
      return NextResponse.json(
        { error: "No subjects assigned to this teacher" },
        { status: 404 }
      );
    }

    // Return the list of assigned subjects with a 200 status code
    return NextResponse.json(assignedSubjects, { status: 200 });
  } catch (error) {
    // Catch any errors and return a 500 Internal Server Error response
    console.error("Error fetching assigned subjects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Ensure Prisma client is disconnected
  }
}
