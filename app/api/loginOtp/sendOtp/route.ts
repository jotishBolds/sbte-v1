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

        @media (prefers-color-scheme: light) {
            body {
                background-color: #f8f9fa;
                color: #1f2937;
            }

            .container {
                background-color: rgba(0, 0, 0, 0.03);
                border-color: rgba(0, 0, 0, 0.1);
            }

            .header h1, .otp-code, .content a, .footer a {
                color: #e11d48;
            }

            .content {
                color: #4b5563;
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
            
            <p>This OTP is valid for <strong>5 minutes</strong>. If you did not request this OTP, please <a href="mailto:support@sbte.com">contact our support team</a> immediately.</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SBTE. All rights reserved.</p>
            <p>Secure OTP Verification </p>
        </div>
    </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your ${purposeText} OTP`,
    html: emailHtml,
    text: `Your OTP for ${purposeText} is ${otp}. It will expire in 5 minutes.`,
  });

  console.log(`OTP sent to ${email}: ${otp}`);
}
