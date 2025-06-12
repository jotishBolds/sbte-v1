import { validateCaptcha } from "@/lib/captcha";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { captchaToken, answer } = await request.json();

    if (!captchaToken || !answer) {
      return NextResponse.json(
        { error: "Missing captcha token or answer" },
        { status: 400 }
      );
    }

    const isValid = validateCaptcha(answer.trim(), captchaToken);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify CAPTCHA" },
      { status: 500 }
    );
  }
}
