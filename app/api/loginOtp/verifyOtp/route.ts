//File : /api/loginOtp/verifyOtp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";

const prisma = new PrismaClient();

// Define Zod schema for validating the request body
const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// POST method to verify OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = verifyOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, otp } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", errorCode: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const currentTime = new Date();

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < currentTime) {
      return NextResponse.json(
        { error: "OTP is invalid or has expired. Request a new one." },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiresAt: null },
    });

    return NextResponse.json(
      { message: "OTP is valid. You can proceed." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Verify OTP API:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        errorCode: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
