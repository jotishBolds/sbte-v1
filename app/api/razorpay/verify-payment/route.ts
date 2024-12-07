//File : /api/razorpay/verify-payment/route.ts

import crypto from "crypto";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { paymentId, orderId, signature } = await request.json();

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature === signature) {
      // Payment verified
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      // Signature mismatch
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error verifying payment",
        details: error,
      },
      { status: 500 }
    );
  }
}
