import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { passwordSchema } from "@/lib/password-validation";

const prisma = new PrismaClient();

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: passwordSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

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

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        passwordHistory: {
          orderBy: { createdAt: "desc" },
          take: 5, // Check last 5 passwords
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", errorCode: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const currentTime = new Date();

    // Verify OTP
    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < currentTime) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP.", errorCode: "INVALID_OTP" },
        { status: 400 }
      );
    }

    // Check password history to prevent reuse
    const hashedNewPassword = await hash(newPassword, 12);
    for (const oldPassword of user.passwordHistory) {
      const isSamePassword = await bcrypt.compare(
        newPassword,
        oldPassword.hashedPassword
      );
      if (isSamePassword) {
        return NextResponse.json(
          { error: "Cannot reuse any of your last 5 passwords." },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(async (prisma) => {
      // Update user's password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          otp: null,
          otpExpiresAt: null,
        },
      });

      // Add new password to history
      await prisma.passwordHistory.create({
        data: {
          userId: user.id,
          hashedPassword: hashedNewPassword,
        },
      });

      // Clean up old password history if more than 5 entries
      const passwordHistoryCount = await prisma.passwordHistory.count({
        where: { userId: user.id },
      });

      if (passwordHistoryCount > 5) {
        const oldestPasswords = await prisma.passwordHistory.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
          take: passwordHistoryCount - 5,
        });

        await prisma.passwordHistory.deleteMany({
          where: {
            id: {
              in: oldestPasswords.map((p) => p.id),
            },
          },
        });
      }
    });

    return NextResponse.json(
      { message: "Password has been reset successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Reset Password API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
