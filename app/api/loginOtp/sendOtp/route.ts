// File: /api/loginOtp/sendOtp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import * as z from "zod";

const prisma = new PrismaClient();

// Enhanced rate limiting storage (use Redis in production)
const otpAttempts = new Map<
  string,
  {
    count: number;
    lastAttempt: number;
    lockedUntil?: number;
  }
>();

// Rate limiting configuration
const MAX_OTP_REQUESTS_PER_HOUR = 5;
const MAX_OTP_REQUESTS_PER_DAY = 10;
const MAX_IP_REQUESTS_PER_HOUR = 5; // IP-based limit
const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes lockout (reduced from 30)
const IP_LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes IP lockout

// Define Zod schema for validating the request body
const otpSchema = z.object({
  email: z.string().email("Invalid email address"),
  purpose: z.enum(["login", "verification"]).optional().default("login"),
});

// Enhanced rate limiting functions
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
  return ip;
}

function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  } else if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else {
    const hours = Math.ceil(seconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
}

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

  // Check email-based rate limiting
  const emailAttempts = otpAttempts.get(emailKey);
  if (emailAttempts) {
    // Check if locked
    if (emailAttempts.lockedUntil && now < emailAttempts.lockedUntil) {
      return {
        allowed: false,
        waitTime: Math.ceil((emailAttempts.lockedUntil - now) / 1000),
        reason: "account_locked",
      };
    }

    // Reset if day has passed
    if (now - emailAttempts.lastAttempt > DAY_IN_MS) {
      otpAttempts.delete(emailKey);
    } else if (emailAttempts.count >= MAX_OTP_REQUESTS_PER_DAY) {
      return {
        allowed: false,
        waitTime: Math.ceil(
          (DAY_IN_MS - (now - emailAttempts.lastAttempt)) / 1000
        ),
        reason: "daily_limit_exceeded",
      };
    }

    // Check hourly limit
    if (
      now - emailAttempts.lastAttempt < HOUR_IN_MS &&
      emailAttempts.count >= MAX_OTP_REQUESTS_PER_HOUR
    ) {
      return {
        allowed: false,
        waitTime: Math.ceil(
          (HOUR_IN_MS - (now - emailAttempts.lastAttempt)) / 1000
        ),
        reason: "hourly_limit_exceeded",
      };
    }
  }

  // Check IP-based rate limiting (reduced wait time)
  const ipAttempts = otpAttempts.get(ipKey);
  if (ipAttempts && ipAttempts.count >= MAX_IP_REQUESTS_PER_HOUR) {
    if (now - ipAttempts.lastAttempt < IP_LOCKOUT_DURATION) {
      return {
        allowed: false,
        waitTime: Math.ceil(
          (IP_LOCKOUT_DURATION - (now - ipAttempts.lastAttempt)) / 1000
        ),
        reason: "ip_rate_limited",
      };
    } else {
      // Reset IP attempts after lockout period
      otpAttempts.delete(ipKey);
    }
  }

  return { allowed: true };
}

function recordOtpAttempt(email: string, clientIp: string, success: boolean) {
  const now = Date.now();
  const emailKey = `email:${email}`;
  const ipKey = `ip:${clientIp}`;

  // Record email attempt
  const emailAttempts = otpAttempts.get(emailKey) || {
    count: 0,
    lastAttempt: now,
  };
  otpAttempts.set(emailKey, {
    count: emailAttempts.count + 1,
    lastAttempt: now,
    lockedUntil: success ? undefined : emailAttempts.lockedUntil,
  });

  // Record IP attempt
  const ipAttempts = otpAttempts.get(ipKey) || { count: 0, lastAttempt: now };
  otpAttempts.set(ipKey, {
    count: ipAttempts.count + 1,
    lastAttempt: now,
  });

  // Lock account if too many failed attempts
  if (!success && emailAttempts.count >= MAX_OTP_REQUESTS_PER_HOUR) {
    const lockedEmail = otpAttempts.get(emailKey);
    if (lockedEmail) {
      lockedEmail.lockedUntil = now + LOCKOUT_DURATION;
    }
  }
}

// Server-side CAPTCHA generation for OTP requests
function generateCaptcha(): { question: string; answer: number; hash: string } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;

  // In production, use a proper hash with secret
  const hash = Buffer.from(`${answer}:${Date.now()}`).toString("base64");

  return {
    question: `${num1} + ${num2}`,
    answer,
    hash,
  };
}

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
    const clientIp = getClientIdentifier(request);

    // Enhanced rate limiting check
    const rateLimitResult = checkRateLimit(email, clientIp);
    if (!rateLimitResult.allowed) {
      recordOtpAttempt(email, clientIp, false);

      let errorMessage = "Too many OTP requests.";
      switch (rateLimitResult.reason) {
        case "account_locked":
          errorMessage = "Account temporarily locked due to too many requests.";
          break;
        case "daily_limit_exceeded":
          errorMessage = "Daily OTP limit exceeded.";
          break;
        case "hourly_limit_exceeded":
          errorMessage = "Hourly OTP limit exceeded.";
          break;
        case "ip_rate_limited":
          errorMessage = "Too many requests from this IP address.";
          break;
      }

      const formattedTime = formatTimeRemaining(rateLimitResult.waitTime || 0);

      return NextResponse.json(
        {
          error: `${errorMessage} Please wait ${formattedTime} before requesting a new OTP.`,
          errorCode: "OTP_RATE_LIMITED",
          waitTime: rateLimitResult.waitTime,
          formattedWaitTime: formattedTime,
        },
        { status: 429 }
      );
    }

    // Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        lastOtpRequestAt: true,
        role: true,
      },
    });

    if (!user) {
      recordOtpAttempt(email, clientIp, false);
      return NextResponse.json(
        {
          error: "No account found with this email address.",
          errorCode: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const currentTime = new Date();

    // Additional throttling based on user's last request
    if (user.lastOtpRequestAt) {
      const timeDifference =
        currentTime.getTime() - new Date(user.lastOtpRequestAt).getTime();
      const minInterval = 60 * 1000; // 1 minute minimum between requests

      if (timeDifference < minInterval) {
        const remainingWaitTime = Math.ceil(
          (minInterval - timeDifference) / 1000
        );
        const formattedTime = formatTimeRemaining(remainingWaitTime);
        recordOtpAttempt(email, clientIp, false);
        return NextResponse.json(
          {
            error: `Please wait ${formattedTime} before requesting a new OTP.`,
            errorCode: "OTP_THROTTLED",
            waitTime: remainingWaitTime,
            formattedWaitTime: formattedTime,
          },
          { status: 429 }
        );
      }
    }

    // Generate secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt,
        lastOtpRequestAt: currentTime,
      },
    });

    // Send OTP email
    await sendOtpEmail(email, otp, purpose);

    // Record successful attempt
    recordOtpAttempt(email, clientIp, true);

    return NextResponse.json(
      {
        message: "OTP has been sent to your email.",
        messageType: "OTP_SENT",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Send OTP API:", error);

    // Log security events for monitoring
    if (error instanceof Error) {
      console.error(`OTP request failed: ${error.message}`);
    }

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

// Enhanced OTP email function with security headers
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
    // Enhanced security settings
    secure: true,
    tls: {
      rejectUnauthorized: true,
    },
  });

  const purposeText =
    purpose === "verification" ? "Account Verification" : "Login";

  // Add security warning for suspicious activity
  const securityNotice = `
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #dc2626; font-size: 14px; margin: 0;">
        <strong>Security Notice:</strong> If you did not request this OTP, your account may be compromised. 
        Please change your password immediately and contact support.
      </p>
    </div>
  `;

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${purposeText} One-Time Password</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html, body {
            height: 100%;
            width: 100%;
            background-color: #1c1917;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #f4f4f4;
            background-color: #1c1917;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background-color: #1c1917;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 
                0 15px 25px rgba(0,0,0,0.2), 
                0 5px 10px rgba(0,0,0,0.1);
            backdrop-filter: blur(15px);
            transition: all 0.3s ease;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #e11d48;
            padding-bottom: 25px;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #e11d48;
            margin: 0;
            font-weight: 700;
            font-size: 1.8rem;
            letter-spacing: -0.5px;
        }

        .otp-code {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            letter-spacing: 12px;
            font-weight: 600;
            color: #e11d48;
            margin: 30px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            user-select: all;
            cursor: copy;
            transition: background-color 0.3s ease;
        }

        .otp-code:hover {
            background-color: rgba(255, 255, 255, 0.15);
        }

        .security-notice {
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #fca5a5;
        }

        .content {
            color: #e2e8f0;
        }

        .content p {
            margin-bottom: 20px;
        }

        .content a {
            color: #e11d48;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }

        .content a:hover {
            color: #f43f5e;
            text-decoration: underline;
        }

        .footer {
            text-align: center;
            color: rgba(226, 232, 240, 0.7);
            font-size: 12px;
            margin-top: 40px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 25px;
        }

        .footer a {
            color: #e11d48;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer a:hover {
            color: #f43f5e;
            text-decoration: underline;
        }

        @media screen and (max-width: 640px) {
            body {
                padding: 10px;
                align-items: flex-start;
            }

            .container {
                padding: 25px;
                margin-top: 20px;
                border-radius: 12px;
            }

            .header h1 {
                font-size: 1.5rem;
            }

            .otp-code {
                font-size: 24px;
                letter-spacing: 8px;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${purposeText} OTP Verification</h1>
        </div>
        
        <div class="content">
            <p>Hello there,</p>
            
            <p>You have requested a one-time password (OTP) for ${purposeText}. Please use the following code to complete your action:</p>
            
            <div class="otp-code" title="Click to copy">
                ${otp}
            </div>
            
            <div class="security-notice">
                <strong>Security Notice:</strong> If you did not request this OTP, your account may be compromised. 
                Please change your password immediately and <a href="mailto:support@sbte.com" style="color: #fca5a5;">contact our support team</a>.
            </div>
            
            <p>This OTP is valid for <strong>5 minutes</strong> and can only be used once. 
            For your security, do not share this code with anyone.</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SBTE. All rights reserved.</p>
            <p>Secure OTP Verification System</p>
        </div>
    </div>
</body>
</html>
  `;

  // Development only: Log OTP for testing
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);
  }

  try {
    await transporter.sendMail({
      from: `"SBTE System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `[SBTE] Your ${purposeText} OTP - ${otp}`,
      html: emailHtml,
      text: `Your OTP for ${purposeText} is ${otp}. It will expire in 5 minutes. If you did not request this, please contact support immediately.`,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    });

    console.log(
      `Secure OTP sent to ${email.replace(/(.{2}).*(@.*)/, "$1***$2")}`
    );
  } catch (emailError) {
    console.error("Email sending error:", emailError);

    // If email fails but OTP is generated, still allow it in development
    if (process.env.NODE_ENV === "development") {
      console.log("EMAIL FAILED BUT OTP GENERATED IN DEV MODE");
      return; // Don't throw error in development
    }

    throw new Error("Failed to send OTP email. Please try again later.");
  } finally {
    transporter.close();
  }
}
