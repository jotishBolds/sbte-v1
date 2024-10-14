import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const batchUpdateSchema = z.object({
    termId: z.string().optional(),
    academicYearId: z.string().optional(),
    batchTypeId: z.string().optional(),
    startDate: z.coerce.date({ required_error: "Start date is required" }).optional(),
    endDate: z.coerce.date({ required_error: "End date is required" }).optional(),
    status: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const collegeId = session.user.collegeId;
        const body = await request.json();
        const validationResult = batchUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const { termId, academicYearId, batchTypeId, startDate, endDate, status } = validationResult.data;

        // Verify if the batch exists and belongs to the user's college
        const existingBatch = await prisma.batch.findFirst({
            where: {
                id: params.id,
                program: {
                    department: {
                        collegeId,
                    },
                },
            },
        });

        if (!existingBatch) {
            return NextResponse.json({ error: "Batch not found" }, { status: 404 });
        }

        // Validate if the provided termId, academicYearId, batchTypeId exist in the college
        if (termId) {
            const term = await prisma.semester.findFirst({
                where: { id: termId, collegeId },
            });
            if (!term) {
                return NextResponse.json({ error: "Invalid semester" }, { status: 400 });
            }
        }

        if (academicYearId) {
            const academicYear = await prisma.academicYear.findFirst({
                where: { id: academicYearId, collegeId },
            });
            if (!academicYear) {
                return NextResponse.json({ error: "Invalid academic year" }, { status: 400 });
            }
        }

        if (batchTypeId) {
            const batchType = await prisma.batchType.findUnique({
                where: { id: batchTypeId },
            });
            if (!batchType) {
                return NextResponse.json({ error: "Invalid batch type" }, { status: 400 });
            }
        }

        // Check if a batch with the same combination of program, term, academic year, and batch type already exists
        const duplicateBatch = await prisma.batch.findFirst({
            where: {
                termId: termId || existingBatch.termId,
                academicYearId: academicYearId || existingBatch.academicYearId,
                batchTypeId: batchTypeId || existingBatch.batchTypeId,
                programId: existingBatch.programId,
                NOT: {
                    id: params.id, // Exclude the current batch being updated
                },
            },
        });

        if (duplicateBatch) {
            return NextResponse.json({
                error: "A batch with the same program, term, academic year, and batch type already exists",
            }, { status: 400 });
        }

        // Update the batch
        const updatedBatch = await prisma.batch.update({
            where: { id: params.id },
            data: {
                termId,
                academicYearId,
                batchTypeId,
                startDate,
                endDate,
                status,
                updatedById: session.user.id,
            },
            include: {
                term: true,
                academicYear: true,
                batchType: true,
                program: true,
            },
        });

        return NextResponse.json({
            id: updatedBatch.id,
            name: updatedBatch.name,
            term: updatedBatch.term.alias,
            academicYear: updatedBatch.academicYear.name,
            batchType: updatedBatch.batchType.name,
            program: updatedBatch.program.code,
            startDate: updatedBatch.startDate,
            endDate: updatedBatch.endDate,
            status: updatedBatch.status,
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating batch:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}



export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user?.role !== "COLLEGE_SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const collegeId = session.user.collegeId;

        // Verify if the batch exists and belongs to the user's college
        const existingBatch = await prisma.batch.findFirst({
            where: {
                id: params.id,
                program: {
                    department: {
                        collegeId,
                    },
                },
            },
        });

        if (!existingBatch) {
            return NextResponse.json({ error: "Batch not found" }, { status: 404 });
        }

        // Delete the batch
        await prisma.batch.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Batch deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting batch:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

