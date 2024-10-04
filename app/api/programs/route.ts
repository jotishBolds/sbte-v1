import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

const prisma = new PrismaClient();

interface ProgramCreationData {
    name: string;
    code: string;
    alias: string;
    departmentId: string;
    programTypeId: string;
    isActive?: boolean;
}


export async function POST(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }else if(session.user?.role !== "COLLEGE_SUPER_ADMIN"){
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
  
      const data: ProgramCreationData = await request.json();
  
      // Validate required fields
      if (!data.name || !data.code || !data.departmentId || !data.programTypeId) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
  
      // Create new program
      const newProgram = await prisma.program.create({
        data: {
          name: data.name,
          code: data.code,
          alias: data.alias,
          department: {
            connect: {
              id: data.departmentId,
            },
          },
          programType: {
            connect: {
              id: data.programTypeId,
            },
          },
          isActive: data.isActive ?? true,
        },
      });
  
      return NextResponse.json(newProgram, { status: 201 });
    } catch (error) {
      console.error("Error creating program:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }