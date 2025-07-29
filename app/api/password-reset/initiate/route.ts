import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";
import { validateCaptcha } from "@/lib/captcha";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

// Rate limiting configuration
const MAX_ATTEMPTS_PER_HOUR = 3;
const MAX_ATTEMPTS_PER_DAY = 5;
const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

// Store attempts in memory (use Redis in production)
const resetAttempts = new Map<
  string,
  {
    count: number;
    lastAttempt: number;
    lockedUntil?: number;
  }
>();

// Schema for initiating password reset
// const initiateResetSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   captchaToken: z.string().min(1, "CAPTCHA verification is required"),
//   captchaAnswer: z.string().min(1, "CAPTCHA answer is required"),
// });
const initiateResetSchema = z.object({
  email: z.string().email("Invalid email address"),
  answer: z.string().min(1, "CAPTCHA answer is required"),
  hash: z.string().min(1, "CAPTCHA hash is required"),
  expiresAt: z.number().min(1, "CAPTCHA expiry is required"),
});

function checkRateLimit(
  email: string,
  clientIp: string
): {
  allowed: boolean;
  waitTime?: number;
  reason?: string;
} {
  const now = Date.now();
  const emailKey = `email:${email}`;
  const ipKey = `ip:${clientIp}`;

  const attempts = resetAttempts.get(emailKey) || {
    count: 0,
    lastAttempt: now,
  };

  // Check if account is locked
  if (attempts.lockedUntil && now < attempts.lockedUntil) {
    return {
      allowed: false,
      waitTime: Math.ceil((attempts.lockedUntil - now) / 1000),
      reason: "account_locked",
    };
  }

  // Reset counts if day has passed
  if (now - attempts.lastAttempt > DAY_IN_MS) {
    resetAttempts.delete(emailKey);
    return { allowed: true };
  }

  // Check daily limit
  if (attempts.count >= MAX_ATTEMPTS_PER_DAY) {
    return {
      allowed: false,
      waitTime: Math.ceil((DAY_IN_MS - (now - attempts.lastAttempt)) / 1000),
      reason: "daily_limit_exceeded",
    };
  }

  // Check hourly limit
  if (
    now - attempts.lastAttempt < HOUR_IN_MS &&
    attempts.count >= MAX_ATTEMPTS_PER_HOUR
  ) {
    return {
      allowed: false,
      waitTime: Math.ceil((HOUR_IN_MS - (now - attempts.lastAttempt)) / 1000),
      reason: "hourly_limit_exceeded",
    };
  }

  return { allowed: true };
}

function recordResetAttempt(email: string, success: boolean): void {
  const now = Date.now();
  const emailKey = `email:${email}`;

  const attempts = resetAttempts.get(emailKey) || {
    count: 0,
    lastAttempt: now,
  };
  attempts.count += 1;
  attempts.lastAttempt = now;

  // Lock account if too many failed attempts
  if (!success && attempts.count >= MAX_ATTEMPTS_PER_HOUR) {
    attempts.lockedUntil = now + LOCKOUT_DURATION;
  }

  resetAttempts.set(emailKey, attempts);
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = initiateResetSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // const { email, captchaToken, captchaAnswer } = validationResult.data;
    const { email, answer, hash, expiresAt } = validationResult.data;

    const clientIp =
      request.headers.get("x-forwarded-for") || request.ip || "unknown";

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(email, clientIp);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many reset attempts. ${
            rateLimitCheck.reason === "account_locked"
              ? "Account is temporarily locked."
              : `Please try again in ${Math.ceil(
                  rateLimitCheck.waitTime! / 60
                )} minutes.`
          }`,
          errorCode: "RATE_LIMITED",
          waitTime: rateLimitCheck.waitTime,
        },
        { status: 429 }
      );
    }

    // Verify CAPTCHA
    // const isCaptchaValid = validateCaptcha(captchaAnswer.trim(), captchaToken);
    const isCaptchaValid = validateCaptcha(answer.trim(), hash, expiresAt);

    if (!isCaptchaValid) {
      recordResetAttempt(email, false);
      return NextResponse.json(
        {
          error: "Incorrect security answer",
          errorCode: "INVALID_CAPTCHA",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        lastOtpRequestAt: true,
      },
    });

    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json(
        {
          message:
            "If an account exists with this email, a reset OTP will be sent.",
        },
        { status: 200 }
      );
    }

    // Check minimum interval between OTP requests
    const currentTime = new Date();
    if (user.lastOtpRequestAt) {
      const timeDifference =
        currentTime.getTime() - new Date(user.lastOtpRequestAt).getTime();
      const minInterval = 60 * 1000; // 1 minute

      if (timeDifference < minInterval) {
        const remainingWaitTime = Math.ceil(
          (minInterval - timeDifference) / 1000
        );
        return NextResponse.json(
          {
            error: `Please wait ${remainingWaitTime} seconds before requesting a new OTP`,
            errorCode: "OTP_THROTTLED",
            waitTime: remainingWaitTime,
          },
          { status: 429 }
        );
      }
    }

    // Generate and store OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiresAt,
        lastOtpRequestAt: currentTime,
      },
    });

    // Send OTP email
    await sendEmail(email, "OTP_RESET_PASSWORD", { otp });

    recordResetAttempt(email, true);

    return NextResponse.json(
      {
        message: "OTP has been sent to your email",
        messageType: "OTP_SENT",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Initiate Password Reset:", error);
    return NextResponse.json(
      {
        error: "An error occurred while initiating password reset",
        errorCode: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
