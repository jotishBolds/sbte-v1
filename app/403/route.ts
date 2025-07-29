import { NextResponse } from "next/server";

export async function GET() {
  // Redirect to the forbidden page
  return NextResponse.redirect(
    new URL("/forbidden", process.env.NEXTAUTH_URL || "http://localhost:3000")
  );
}

export async function POST() {
  // Redirect to the forbidden page
  return NextResponse.redirect(
    new URL("/forbidden", process.env.NEXTAUTH_URL || "http://localhost:3000")
  );
}
