import { validateCaptcha } from "@/lib/captcha";
import { NextResponse } from "next/server";

// Force this route to be dynamic and not cached during build
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { answer, hash, expiresAt } = await request.json();

    if (!hash || !answer || !expiresAt) {
      return NextResponse.json(
        { error: "Missing security check data" },
        { status: 400 }
      );
    }

    const isValid = validateCaptcha(answer.trim(), hash, expiresAt);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify security check" },
      { status: 500 }
    );
  }
}
