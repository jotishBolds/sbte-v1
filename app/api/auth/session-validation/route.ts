import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import {
  validateUserSession,
  cleanupExpiredSessions,
} from "@/lib/enhanced-session-management";
import { getClientInfoFromNextRequest } from "@/lib/audit-logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { valid: false, reason: "No session" },
        { status: 401 }
      );
    }

    const { ipAddress, userAgent } = getClientInfoFromNextRequest(request);

    // Check user status in database directly
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isLoggedIn: true,
        sessionToken: true,
        sessionExpiresAt: true,
        lastActivity: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, reason: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is logged in
    if (!user.isLoggedIn) {
      return NextResponse.json(
        { valid: false, reason: "User not logged in" },
        { status: 401 }
      );
    }

    // Check session expiry
    if (user.sessionExpiresAt && new Date() > user.sessionExpiresAt) {
      // Clean up expired session
      await prisma.user.update({
        where: { id: session.user.id },
        data: { isLoggedIn: false, sessionToken: null },
      });

      return NextResponse.json(
        { valid: false, reason: "Session expired" },
        { status: 401 }
      );
    }

    // Session is valid
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        reason: "Validation error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin endpoint to cleanup expired sessions
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.role ||
      !["SBTE_ADMIN", "EDUCATION_DEPARTMENT"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const cleanedUp = await cleanupExpiredSessions();

    return NextResponse.json({
      message: "Session cleanup completed",
      cleanedSessions: cleanedUp,
    });
  } catch (error) {
    console.error("Session cleanup error:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
      },
      { status: 500 }
    );
  }
}
