// api/teacherSubjectAssign/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Validation schema for the subjects being assigned
const assignSubjectsSchema = z.object({
    subjectIds: z.array(z.string()), // Array of subject IDs to be assigned
});

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } } // id refers to the teacherId
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // if (session.user?.role !== "HOD") {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        const teacherId = params.id;
        const body = await request.json();

        // Validate the body
        const validationResult = assignSubjectsSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const { subjectIds } = validationResult.data;

        // Verify if the teacher exists
        const existingTeacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
        });

        if (!existingTeacher) {
            return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        }

        // Fetch already assigned subjects for the teacher
        const alreadyAssignedSubjects = await prisma.teacherAssignedSubject.findMany({
            where: {
                teacherId,
                batchSubjectId: {
                    in: subjectIds, // Check for any of the subjects being passed
                },
            },
        });

        // Get the IDs of already assigned subjects
        const alreadyAssignedSubjectIds = alreadyAssignedSubjects.map(
            (assignment) => assignment.batchSubjectId
        );

        // Filter out subjects that are already assigned
        const subjectsToAssign = subjectIds.filter(
            (subjectId) => !alreadyAssignedSubjectIds.includes(subjectId)
        );

        if (subjectsToAssign.length === 0) {
            return NextResponse.json(
                { message: "All selected subjects have already been assigned to the teacher" },
                { status: 400 }
            );
        }

        // Assign the remaining subjects
        const assignedSubjects = await Promise.all(
            subjectsToAssign.map(async (subjectId) => {
                // Verify if the subject exists
                const existingSubject = await prisma.batchSubject.findUnique({
                    where: { id: subjectId },
                });

                if (!existingSubject) {
                    throw new Error(`Subject with ID ${subjectId} not found`);
                }

                // Create a record in TeacherAssignedSubject
                return prisma.teacherAssignedSubject.create({
                    data: {
                        teacherId,
                        batchSubjectId: subjectId,
                    },
                });
            })
        );

        return NextResponse.json(
            {
                message: "Subjects assigned successfully",
                data: assignedSubjects,
                skippedSubjects: alreadyAssignedSubjectIds, // Return the subjects that were already assigned
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error assigning subjects:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
  
      const teacherId = params.id;
  
      // Check if the teacher exists
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
      });
  
      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
      }
  
      // Fetch all subjects assigned to the teacher
      const assignedSubjects = await prisma.teacherAssignedSubject.findMany({
        where: {
          teacherId,
        },
        include: {
          batchSubject: {
            include: {
              subject: true, // Fetch subject details
              subjectType: true, // Fetch subject type details
              batch: true, // Fetch batch details
            },
          },
        },
      });
  
      if (assignedSubjects.length === 0) {
        return NextResponse.json(
          { error: "No subjects assigned to this teacher" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(assignedSubjects, { status: 200 });
    } catch (error) {
      console.error("Error fetching assigned subjects:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
  
