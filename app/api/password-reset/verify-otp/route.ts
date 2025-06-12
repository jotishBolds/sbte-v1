import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";

const prisma = new PrismaClient();

// Rate limiting settings
const MAX_VERIFY_ATTEMPTS = 3;
const VERIFY_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Define Zod schema for validating the request body
const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

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
      select: {
        id: true,
        email: true,
        otp: true,
        otpExpiresAt: true,
        otpVerifyAttempts: true,
        otpVerifyLockedUntil: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", errorCode: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const currentTime = new Date();

    // Check if user is locked out from verifying
    if (user.otpVerifyLockedUntil && user.otpVerifyLockedUntil > currentTime) {
      const remainingTime = Math.ceil(
        (user.otpVerifyLockedUntil.getTime() - currentTime.getTime()) /
          1000 /
          60
      );
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please wait ${remainingTime} minutes before trying again.`,
          errorCode: "VERIFY_LOCKED",
          remainingTime,
        },
        { status: 429 }
      );
    }

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < currentTime) {
      return NextResponse.json(
        {
          error: "OTP is invalid or has expired. Please request a new one.",
          errorCode: "INVALID_OTP",
        },
        { status: 400 }
      );
    }

    // Reset attempts if OTP has been refreshed
    const attempts = user.otpVerifyAttempts || 0;

    // Validate OTP
    if (user.otp !== otp.trim()) {
      const newAttempts = attempts + 1;
      const updateData: any = {
        otpVerifyAttempts: newAttempts,
      };

      // Lock account if max attempts reached
      if (newAttempts >= MAX_VERIFY_ATTEMPTS) {
        updateData.otpVerifyLockedUntil = new Date(
          currentTime.getTime() + VERIFY_LOCKOUT_DURATION
        );
        updateData.otpVerifyAttempts = 0; // Reset attempts
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      const remainingAttempts = MAX_VERIFY_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          error:
            remainingAttempts > 0
              ? `Invalid OTP. ${remainingAttempts} attempts remaining.`
              : "Too many failed attempts. Please wait 15 minutes before trying again.",
          errorCode: "INVALID_OTP",
          remainingAttempts: Math.max(0, remainingAttempts),
        },
        { status: 400 }
      );
    }

    // Update verification status but keep OTP for password reset
    await prisma.$transaction(async (prisma) => {
      // Delete any existing verification history
      await prisma.verificationHistory.deleteMany({
        where: { userId: user.id },
      });

      // Update verification status but keep OTP valid for password reset
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpVerifyAttempts: 0,
          otpVerifyLockedUntil: null,
          lastOtpVerifiedAt: currentTime,
        },
      });

      // Create new verification history
      await prisma.verificationHistory.create({
        data: {
          userId: user.id,
          verifiedAt: currentTime,
          ipAddress: request.ip || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    });

    return NextResponse.json(
      { message: "OTP verified successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Password Reset OTP Verification:", error);
    return NextResponse.json(
      {
        error: "An error occurred while verifying OTP. Please try again.",
        errorCode: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
