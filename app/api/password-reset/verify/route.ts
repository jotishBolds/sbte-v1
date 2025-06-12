import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";
import { hash } from "bcryptjs";
import { passwordSchema } from "@/lib/password-validation";

const prisma = new PrismaClient();

const verifyResetSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "Invalid OTP format"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = verifyResetSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = validationResult.data;

    // Find user and check OTP
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      return NextResponse.json(
        {
          error: "Invalid or expired OTP",
          errorCode: "INVALID_OTP",
        },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > user.resetOtpExpiresAt) {
      // Clear expired OTP
      await prisma.user.update({
        where: { email },
        data: {
          resetOtp: null,
          resetOtpExpiresAt: null,
        },
      });

      return NextResponse.json(
        {
          error: "OTP has expired. Please request a new one.",
          errorCode: "OTP_EXPIRED",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.resetOtp !== otp) {
      return NextResponse.json(
        {
          error: "Invalid OTP",
          errorCode: "INVALID_OTP",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update user password and clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiresAt: null,
      },
    });

    // Store password in history
    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "Password has been reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in password reset verification:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        errorCode: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
