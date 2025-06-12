import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/captcha";

export async function GET() {
  try {
    const captcha = generateCaptcha();

    return NextResponse.json({
      question: captcha.question,
      hash: captcha.hash,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate CAPTCHA" },
      { status: 500 }
    );
  }
}
