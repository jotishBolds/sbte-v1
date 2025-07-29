import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user has an active session
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        isLoggedIn: true,
        sessionToken: true,
        sessionExpiresAt: true,
        lastActivity: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasActiveSession =
      user.isLoggedIn &&
      user.sessionToken &&
      user.sessionExpiresAt &&
      new Date() < user.sessionExpiresAt;

    if (hasActiveSession) {
      // Log concurrent session attempt
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await logSecurityEvent({
        eventType: "CONCURRENT_SESSION_ATTEMPT",
        userId: user.id,
        userEmail: email,
        ipAddress,
        userAgent,
        details: "User attempting to login while another session is active",
        severity: "MEDIUM",
      });

      return NextResponse.json({
        hasActiveSession: true,
        userId: user.id,
        lastActivity: user.lastActivity,
      });
    }

    return NextResponse.json({ hasActiveSession: false });
  } catch (error) {
    console.error("Error checking active session:", error);
    return NextResponse.json(
      { error: "Failed to check active session" },
      { status: 500 }
    );
  }
}
