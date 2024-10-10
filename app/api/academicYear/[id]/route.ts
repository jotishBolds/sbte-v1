// api/academicyear/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Validation schema for updating Academic Year with all fields optional
const academicYearUpdateSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.boolean().optional(),
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
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = academicYearUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify the academic year exists and belongs to the user's college
    const existingAcademicYear = await prisma.academicYear.findFirst({
      where: {
        id: params.id,
        collegeId,
      },
    });

    if (!existingAcademicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      );
    }

    // Handle date validation with existing dates
    if (data.startDate && !data.endDate) {
      // If only startDate is being updated, compare it with the existing endDate
      if (data.startDate >= existingAcademicYear.endDate) {
        return NextResponse.json(
          { error: "Start date must be before the existing end date" },
          { status: 400 }
        );
      }
    } else if (!data.startDate && data.endDate) {
      // If only endDate is being updated, compare it with the existing startDate
      if (existingAcademicYear.startDate >= data.endDate) {
        return NextResponse.json(
          { error: "End date must be after the existing start date" },
          { status: 400 }
        );
      }
    } else if (data.startDate && data.endDate) {
      // If both startDate and endDate are being updated, compare them directly
      if (data.startDate >= data.endDate) {
        return NextResponse.json(
          { error: "Start date must be before end date" },
          { status: 400 }
        );
      }
    }

    const updatedAcademicYear = await prisma.academicYear.update({
      where: { id: params.id },
      data, // Only the provided fields will be updated
    });

    return NextResponse.json(updatedAcademicYear, { status: 200 });
  } catch (error) {
    console.error("Error updating academic year:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
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

    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow users with the "COLLEGE_SUPER_ADMIN" role to delete academic years
    if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collegeId = session.user.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "User is not associated with a college" },
        { status: 400 }
      );
    }

    const { id } = params;

    // Verify that the academic year exists and belongs to the user's college
    const existingAcademicYear = await prisma.academicYear.findFirst({
      where: {
        id,
        collegeId,
      },
    });

    if (!existingAcademicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      );
    }

    // Proceed with deletion of the academic year
    await prisma.academicYear.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Academic year deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting academic year:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
