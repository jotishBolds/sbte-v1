import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/auth";
import { cleanupUserSession } from "@/lib/session-cleanup";
import { terminateAllUserSessions } from "@/lib/enhanced-session-management";
import prisma from "@/src/lib/prisma";
import {
  logAuditEvent,
  getClientInfoFromNextRequest,
} from "@/lib/audit-logger";
import { createApiResponse, createApiErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ipAddress, userAgent } = getClientInfoFromNextRequest(request);
    const body = await request.json();
    const { userId, reason, forced = false } = body;

    // Verify the user is cleaning up their own session
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Enhanced session cleanup
    await cleanupUserSession(userId);
    await terminateAllUserSessions(userId, ipAddress, userAgent);

    // Update user status in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        isLoggedIn: false,
        sessionToken: null,
        sessionExpiresAt: null,
        sessionIpAddress: null,
        sessionUserAgent: null,
        lastActivity: new Date(),
      },
    });

    // Log the session cleanup
    await logAuditEvent({
      userId: session.user.id,
      userEmail: session.user.email || "",
      action: forced ? "FORCED_SESSION_CLEANUP" : "SESSION_CLEANUP",
      resource: "USER_SESSION",
      details: reason || "Session cleanup initiated",
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return NextResponse.json({
      message: "Session cleanup successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in session cleanup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user session information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isLoggedIn: true,
        sessionToken: true,
        sessionExpiresAt: true,
        sessionIpAddress: true,
        sessionUserAgent: true,
        lastActivity: true,
        sessionCreatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      isLoggedIn: user.isLoggedIn,
      sessionValid: user.sessionExpiresAt
        ? new Date() < user.sessionExpiresAt
        : false,
      lastActivity: user.lastActivity,
      sessionCreatedAt: user.sessionCreatedAt,
      sessionInfo: {
        ipAddress: user.sessionIpAddress,
        userAgent: user.sessionUserAgent,
      },
    });
  } catch (error) {
    console.error("Session info retrieval error:", error);
    return NextResponse.json(
      { error: "Session info retrieval failed" },
      { status: 500 }
    );
  }
}
