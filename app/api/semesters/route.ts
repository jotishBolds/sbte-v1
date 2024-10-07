import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

// Initialize Prisma Client
const prisma = new PrismaClient();

interface SemesterCreationData {
    name: string;
    alias: string;
    numerical: number;
    //   collegeId: string;
}

// POST: Create a new Semester
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if the user is authenticated and authorized
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const data: SemesterCreationData = await request.json();
        const collegeId = session.user.collegeId;

        // Validate input fields
        if (!data.name || data.numerical == null || !data.alias) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }
        if (!collegeId) {
            return NextResponse.json(
                { error: "No College associated with the user." },
                { status: 404 }
            );
        }

        const existingSemester = await prisma.semester.findFirst({
            where: {
                OR: [
                    { numerical: data.numerical, collegeId },
                    { name: data.name, collegeId },
                    { alias: data.alias, collegeId }
                ],
            },
        });

        if (existingSemester) {
            let conflictField = "numerical representation";
            if (existingSemester.numerical === data.numerical) { conflictField = "numerical representation"; }
            else if (existingSemester.name === data.name) { conflictField = "name"; }
            else if (existingSemester.alias === data.alias) { conflictField = "alias"; }

            return NextResponse.json(
                { error: `Semester with the ${conflictField} already exists in this college.` },
                { status: 409 }
            );
        }


        // Create a new Semester
        const newSemester = await prisma.semester.create({
            data: {
                name: data.name,
                numerical: data.numerical,
                alias: data.alias,
                college: {
                    connect: {
                        id: collegeId,
                    },
                },
            },
        });

        return NextResponse.json(newSemester, { status: 201 });
    } catch (error) {
        console.error("Error creating semester:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// GET: Retrieve all Semesters for the current college
export async function GET(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      } else if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
  
      const collegeId = session.user.collegeId;
      if (!collegeId) {
        return NextResponse.json(
          { error: "No college associated with the user." },
          { status: 404 }
        );
      }
  
      const semesters = await prisma.semester.findMany({
        where: { collegeId },
        include: {
          college: {
            select: {
              name: true, // Include college name for context
            },
          },
        },
      });
  
      if (semesters.length === 0) {
        return NextResponse.json(
          { message: "No semesters found for this college." },
          { status: 200 }
        );
      }
  
      return NextResponse.json(semesters, { status: 200 });
    } catch (error) {
      console.error("Error fetching semesters:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
