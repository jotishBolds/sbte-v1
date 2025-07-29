import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Terminate all sessions for the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionToken: null,
        isLoggedIn: false,
        sessionExpiresAt: null,
        lastActivity: new Date(), // Update last activity to current time
      },
    });

    // Log the session termination
    await logAuditEvent({
      userId,
      action: "SESSIONS_TERMINATED",
      resource: "USER_SESSION",
      details: "All sessions terminated for the user",
      status: "SUCCESS",
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { message: "All sessions terminated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error terminating sessions:", error);
    return NextResponse.json(
      { error: "Failed to terminate sessions" },
      { status: 500 }
    );
  }
}
