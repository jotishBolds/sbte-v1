//File : /api/razorpay/update-payment/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Adjust import based on your NextAuth setup
import { z } from "zod";
import prisma from "@/src/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

// Define Zod schema for validating request body
const updatePaymentSchema = z.object({
  paymentId: z.string(),
  razorpayPaymentId: z.string(),
  studentBatchExamFeeIds: z.array(z.string()).nonempty(),
});

export async function PUT(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow certain roles (e.g., FINANCE_MANAGER)
    // if (session.user?.role !== "FINANCE_MANAGER") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = updatePaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { studentBatchExamFeeIds, razorpayPaymentId, paymentId } =
      validationResult.data;
    // Check if the payment exists and belongs to the user's college
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        studentBatchExamFees: true,
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update payment status and related entities
    const updatedData = await prisma.$transaction(async (prisma) => {
      // Update the payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "COMPLETED", razorpayPaymentId },
      });

      // Update the payment status in the related StudentBatchExamFee table
      await prisma.studentBatchExamFee.updateMany({
        where: { id: { in: studentBatchExamFeeIds } },
        data: { paymentStatus: "COMPLETED" },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment and related statuses updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
