//File : /api/razorpay/create-order/route.ts

import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "", // Replace with your Razorpay Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET || "", // Replace with your Razorpay Secret Key
});

export async function POST(request: Request) {
  try {
    const {
      studentBatchExamFeeIds,
      amount,
      currency = "INR",
    } = await request.json();

    // Check for completed payment statuses in the studentBatchExamFee table
    const completedFees = await prisma.studentBatchExamFee.findMany({
      where: {
        id: {
          in: studentBatchExamFeeIds,
        },
        paymentStatus: "COMPLETED", // Filter for completed payments
      },
      select: {
        id: true, // Only fetch the IDs of the completed fees
      },
    });

    // Check for completed payment statuses in the payments table
    const completedPayments = await prisma.payment.findMany({
      where: {
        studentBatchExamFees: {
          some: {
            id: {
              in: studentBatchExamFeeIds,
            },
          },
        },
        status: "COMPLETED", // Filter for completed payments
      },
      select: {
        id: true,
        studentBatchExamFees: {
          select: {
            id: true, // Fetch related studentBatchExamFee IDs
          },
        },
      },
    });

    // Collect IDs of already paid fees from both checks
    const alreadyPaidIds = [
      ...completedFees.map((fee) => fee.id),
      ...completedPayments.flatMap((payment) =>
        payment.studentBatchExamFees.map((fee) => fee.id)
      ),
    ];

    // If there are already paid fees, return an error response
    if (alreadyPaidIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Some fees have already been paid.",
          completedIds: Array.from(new Set(alreadyPaidIds)), // Remove duplicates
        },
        { status: 400 }
      );
    }

    // Fetch the exam fees for the provided StudentBatchExamFee IDs
    const examFees = await prisma.studentBatchExamFee.findMany({
      where: {
        id: {
          in: studentBatchExamFeeIds,
        },
      },
    });

    // Calculate the total amount from the exam fees
    const totalAmount = examFees.reduce((sum, fee) => sum + fee.examFee, 0);

    // Cross-check if the provided amount matches the calculated total amount
    if (totalAmount !== amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount mismatch",
          details: `The provided amount (${amount}) does not match the total exam fees (${totalAmount}).`,
        },
        { status: 400 }
      );
    }

    // Create an order in Razorpay
    const options = {
      amount: totalAmount * 100, // Convert to smallest currency unit (paise)
      currency: currency,
      receipt: `receipt_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create a new payment record in the database
    const payment = await prisma.payment.create({
      data: {
        amount: totalAmount,
        status: "PENDING", // Initially set to PENDING
        orderId: razorpayOrder.id,
        studentBatchExamFees: {
          connect: studentBatchExamFeeIds.map((id: string) => ({ id })),
        },
      },
    });

    // Return the order details and payment status
    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error creating Razorpay order and payment",
        details: error,
      },
      { status: 500 }
    );
  }
}
