import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export async function GET(request: NextRequest) {
  console.log("Departments API route accessed");

  try {
    console.log("Attempting to fetch departments");
    const departments = await prisma.department.findMany({
      include: {
        college: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Fetched ${departments.length} departments`);

    if (departments.length === 0) {
      console.log("No departments found. Checking database connection...");
      // Perform a simple query to check database connection
      const dbCheck = await prisma.$queryRaw`SELECT 1 as result`;
      console.log("Database connection check result:", dbCheck);
    }

    return NextResponse.json(departments);
  } catch (error: unknown) {
    console.error("Error in departments API route:", error);

    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
