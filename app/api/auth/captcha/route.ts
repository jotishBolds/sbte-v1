import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/captcha";

// Force this route to be dynamic and not cached during build
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const captcha = generateCaptcha();

    // Add cache control headers to prevent caching in production
    const response = NextResponse.json({
      question: captcha.question,
      hash: captcha.hash,
      expiresAt: captcha.expiresAt,
    });

    // Prevent caching for security
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");

    return response;
  } catch (error) {
    console.error("CAPTCHA generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CAPTCHA" },
      { status: 500 }
    );
  }
}
