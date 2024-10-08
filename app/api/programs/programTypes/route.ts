import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

interface ProgramTypeCreationData {
  name: string;
  collegeId: string;
}

// POST request to create a new ProgramType
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const collegeId = session.user.collegeId;

    if (!collegeId) {
      return new Response(JSON.stringify({ error: "College ID not found" }), {
        status: 400,
      });
    }

    const newProgramType = await prisma.programType.create({
      data: {
        name,
        college: {
          connect: {
            id: collegeId,
          },
        },
      },
    });

    return new Response(JSON.stringify(newProgramType), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating program type:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create program type" }),
      {
        status: 500,
      }
    );
  }
}

// GET request to retrieve all ProgramTypes for the current user's college
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
        { status: 400 }
      );
    }

    const programTypes = await prisma.programType.findMany({
      where: { collegeId },
      include: {
        college: {
          select: {
            name: true,
          },
        },
      },
    });

    // Always return 200 status, with an empty array if no types found
    return NextResponse.json(programTypes, { status: 200 });
  } catch (error) {
    console.error("Error fetching program types:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
