// File: /api/auth/check-lock-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import * as z from "zod";

// Configuration constants - MUST match the ones in NextAuth config
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour window for counting attempts

// Request validation schema
const checkLockSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = checkLockSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;
    const currentTime = new Date();

    // Find user and their recent login attempts
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isLocked: true,
        lockedUntil: true,
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        lockoutCount: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          isLocked: false,
          failedAttempts: 0,
          maxAttempts: MAX_LOGIN_ATTEMPTS,
        },
        { status: 200 }
      );
    }

    // Check if user is currently locked
    if (user.isLocked && user.lockedUntil) {
      if (currentTime < user.lockedUntil) {
        // Still locked
        const remainingTime = Math.ceil(
          (user.lockedUntil.getTime() - currentTime.getTime()) / 1000
        );

        return NextResponse.json({
          isLocked: true,
          lockedUntil: user.lockedUntil.toISOString(),
          remainingTime,
          failedAttempts: user.failedLoginAttempts,
          maxAttempts: MAX_LOGIN_ATTEMPTS,
          lockoutCount: user.lockoutCount,
        });
      } else {
        // Lock has expired, unlock the user but keep track of previous lockouts
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isLocked: false,
            lockedUntil: null,
            failedLoginAttempts: 0,
          },
        });

        return NextResponse.json({
          isLocked: false,
          failedAttempts: 0,
          maxAttempts: MAX_LOGIN_ATTEMPTS,
          lockoutCount: user.lockoutCount,
        });
      }
    }

    // Check if we need to reset failed attempts counter due to time window expiry
    if (user.lastFailedLoginAt) {
      const timeSinceLastFailure =
        currentTime.getTime() - user.lastFailedLoginAt.getTime();

      if (timeSinceLastFailure > ATTEMPT_WINDOW) {
        // Reset failed attempts as the window has passed
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
          },
        });

        return NextResponse.json({
          isLocked: false,
          failedAttempts: 0,
          maxAttempts: MAX_LOGIN_ATTEMPTS,
          lockoutCount: user.lockoutCount,
        });
      }
    }

    // Return current status
    return NextResponse.json({
      isLocked: false,
      failedAttempts: user.failedLoginAttempts,
      maxAttempts: MAX_LOGIN_ATTEMPTS,
      lockoutCount: user.lockoutCount,
    });
  } catch (error) {
    console.error("Error checking account lock status:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        errorCode: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
