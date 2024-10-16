import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define Zod schema for Designation
const designationSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters").optional()  ,
    alias: z.string().min(1, "Alias must be at least 1 characters")
        .max(50, "Alias must be less than 50 characters").optional(),
    description: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user?.role !== "COLLEGE_SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const collegeId = session.user.collegeId;
        if (!collegeId) return NextResponse.json({ error: "User not associated with a college" }, { status: 400 });

        const designation = await prisma.designation.findFirst({
            where: { id: params.id, collegeId },
        });

        if (!designation) {
            return NextResponse.json({ error: "Designation not found" }, { status: 404 });
        }

        return NextResponse.json(designation, { status: 200 });
    } catch (error) {
        console.error("Error fetching designation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user?.role !== "COLLEGE_SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const collegeId = session.user.collegeId;
        if (!collegeId) return NextResponse.json({ error: "User not associated with a college" }, { status: 400 });

        const body = await request.json();
        const validationResult = designationSchema.partial().safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ error: "Validation failed", details: validationResult.error.format() }, { status: 400 });
        }

        const data = validationResult.data;

        const existingDesignation = await prisma.designation.findFirst({
            where: { id: params.id, collegeId },
        });

        if (!existingDesignation) {
            return NextResponse.json({ error: "Designation not found" }, { status: 404 });
        }

        // Check for name or alias duplication
        if (data.name || data.alias) {
            const duplicateDesignation = await prisma.designation.findFirst({
                where: {
                    OR: [{ name: data.name }, { alias: data.alias }],
                    collegeId,
                    NOT: { id: params.id },
                },
            });

            if (duplicateDesignation) {
                return NextResponse.json({ error: "Designation with this name or alias already exists" }, { status: 409 });
            }
        }

        const updatedDesignation = await prisma.designation.update({
            where: { id: params.id },
            data,
        });

        return NextResponse.json(updatedDesignation, { status: 200 });
    } catch (error) {
        console.error("Error updating designation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user?.role !== "COLLEGE_SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const collegeId = session.user.collegeId;
        if (!collegeId) return NextResponse.json({ error: "User not associated with a college" }, { status: 400 });

        const existingDesignation = await prisma.designation.findFirst({
            where: { id: params.id, collegeId },
        });

        if (!existingDesignation) {
            return NextResponse.json({ error: "Designation not found" }, { status: 404 });
        }

        await prisma.designation.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Designation deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting designation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

