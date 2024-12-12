//File : /api/loginOtp/sendOtp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import * as z from "zod";

const prisma = new PrismaClient();

// Define Zod schema for validating the request body
const otpSchema = z.object({
  email: z.string().email("Invalid email address"),
  purpose: z.enum(["login", "verification"]).optional().default("login"),
});

// POST method to generate or send OTP
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = otpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, purpose } = validationResult.data;

    // Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "No account found with this email address.",
          errorCode: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const currentTime = new Date();
    const lastOtpRequestTime = user.lastOtpRequestAt;

    if (lastOtpRequestTime) {
      const timeDifference =
        currentTime.getTime() - new Date(lastOtpRequestTime).getTime();
      const throttleLimit = 30 * 1000; // 30 seconds

      if (timeDifference < throttleLimit) {
        const remainingWaitTime = Math.ceil(
          (throttleLimit - timeDifference) / 1000
        );
        return NextResponse.json(
          {
            error: `Please wait ${remainingWaitTime} seconds before requesting a new OTP.`,
            errorCode: "OTP_THROTTLED",
          },
          { status: 429 }
        );
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(currentTime.getTime() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt, lastOtpRequestAt: currentTime },
    });

    await sendOtpEmail(email, otp, purpose);

    return NextResponse.json(
      {
        message: "OTP has been sent to your email.",
        messageType: "OTP_SENT",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Send OTP API:", error);
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

// Function to send OTP via email
async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const purposeText =
    purpose === "verification" ? "Account Verification" : "Login";

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your ${purposeText} OTP`,
    text: `Your OTP for ${purposeText} is ${otp}. It will expire in 5 minutes.`,
  });

  console.log(`OTP sent to ${email}: ${otp}`);
}
