import { validateCaptcha } from "@/lib/captcha";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { captchaToken, answer, expiresAt } = await request.json();

    if (!captchaToken || !answer || !expiresAt) {
      return NextResponse.json(
        { error: "Missing captcha token, answer, or expiry" },
        { status: 400 }
      );
    }

    const isValid = validateCaptcha(answer.trim(), captchaToken, expiresAt);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify CAPTCHA" },
      { status: 500 }
    );
  }
}
