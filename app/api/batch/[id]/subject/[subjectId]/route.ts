// api/batch-subject/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import * as z from "zod";

const prisma = new PrismaClient();

const batchSubjectUpdateSchema = z.object({
    creditScore: z.number().optional(),
    subjectTypeId: z.string().optional(),
    classType: z.enum(["PRACTICAL", "THEORY", "BOTH"]).optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: { subjectId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // if (session.user?.role !== "HOD") {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        const body = await request.json();
        const validationResult = batchSubjectUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.format(),
                },
                { status: 400 }
            );
        }

        const { creditScore, subjectTypeId, classType } = validationResult.data;

        // Verify if the BatchSubject exists
        const existingBatchSubject = await prisma.batchSubject.findUnique({
            where: { id: params.subjectId },
        });

        if (!existingBatchSubject) {
            return NextResponse.json({ error: "BatchSubject not found" }, { status: 404 });
        }

        // Check if the provided subjectTypeId exists
        if (subjectTypeId) {
            const existingSubjectType = await prisma.subjectType.findUnique({
                where: { id: subjectTypeId },
            });

            if (!existingSubjectType) {
                return NextResponse.json(
                    { error: "Invalid subject type" },
                    { status: 400 }
                );
            }
        }

        // Construct the data object with only provided fields
        const updateData: any = {};
        if (creditScore !== undefined) updateData.creditScore = creditScore;
        if (subjectTypeId !== undefined && subjectTypeId !== "") updateData.subjectTypeId = subjectTypeId;
        if (classType !== undefined) updateData.classType = classType;

        // Update only the allowed fields that were passed
        const updatedBatchSubject = await prisma.batchSubject.update({
            where: { id: params.subjectId },
            data: updateData,
        });

        return NextResponse.json(
            { message: "BatchSubject updated successfully", data: updatedBatchSubject },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating BatchSubject:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// api/batch-subject/[id]/route.ts

export async function DELETE(
    request: NextRequest,
    { params }: { params: { subjectId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // if (session.user?.role !== "HOD") {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        const collegeId = session.user.collegeId;
        if (!collegeId) {
            return NextResponse.json({ error: "User not associated with a college" }, { status: 400 });
        }

        // Find the BatchSubject to delete
        const batchSubject = await prisma.batchSubject.findUnique({
            where: { id: params.subjectId },
            include: { subject: true, batch: { include: { program: { include: { department: true } } } } },
        });

        if (!batchSubject || batchSubject.batch.program.department.collegeId !== collegeId) {
            return NextResponse.json({ error: "BatchSubject not found or you don't have access" }, { status: 404 });
        }

        // Delete the BatchSubject
        await prisma.batchSubject.delete({
            where: { id: params.subjectId },
        });

        return NextResponse.json({ message: "BatchSubject deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting BatchSubject:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
