// api/academicyear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

// Validation schema for Academic Year
const academicYearSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
    startDate: z.coerce.date({ required_error: "Start date is required" }),
    endDate: z.coerce.date({ required_error: "End date is required" }),
    status: z.boolean({ required_error: "Status is required" }),
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
        if (!collegeId) {
            return NextResponse.json({ error: "User is not associated with a college" }, { status: 400 });
        }

        const body = await request.json();
        const validationResult = academicYearSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ error: "Validation failed", details: validationResult.error.format() }, { status: 400 });
        }

        const data = validationResult.data;

        // Ensure startDate is before endDate
        if (data.startDate >= data.endDate) {
            return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
        }

        // Ensure startDate is before endDate
        if (data.startDate >= data.endDate) {
            return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
        }

        // Check if an academic year with the same name already exists in the college
        const existingAcademicYearByName = await prisma.academicYear.findFirst({
            where: {
                name: data.name,
                collegeId,
            },
        });

        if (existingAcademicYearByName) {
            return NextResponse.json({ error: "An academic year with this name already exists" }, { status: 409 });
        }

        const newAcademicYear = await prisma.academicYear.create({
            data: {
                ...data,
                collegeId,
            },
        });

        return NextResponse.json(newAcademicYear, { status: 201 });
    } catch (error) {
        console.error("Error creating academic year:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const collegeId = session.user.collegeId;
        if (!collegeId) {
            return NextResponse.json({ error: "User is not associated with a college" }, { status: 400 });
        }

        const academicYears = await prisma.academicYear.findMany({
            where: {
                collegeId,
            },
            include: {
                students: { select: { id: true, name: true } },
                batches: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json(academicYears, { status: 200 });
    } catch (error) {
        console.error("Error fetching academic years:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}