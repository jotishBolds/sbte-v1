import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredSessions } from "@/lib/enhanced-session-management";
import { logAuditEvent } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    // Verify this is coming from an authorized source (could be a cron job)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_SECRET || "cleanup-secret-key";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cleanedSessions = await cleanupExpiredSessions();

    // Log the cleanup operation
    await logAuditEvent({
      action: "SCHEDULED_SESSION_CLEANUP",
      resource: "SYSTEM_MAINTENANCE",
      details: `Cleaned up ${cleanedSessions} expired sessions`,
      ipAddress: "system",
      userAgent: "cleanup-job",
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      cleanedSessions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Session cleanup job failed:", error);

    await logAuditEvent({
      action: "SCHEDULED_SESSION_CLEANUP",
      resource: "SYSTEM_MAINTENANCE",
      details: `Session cleanup failed: ${error}`,
      ipAddress: "system",
      userAgent: "cleanup-job",
      status: "FAILURE",
    });

    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

// GET endpoint for manual cleanup (admin only)
export async function GET(request: NextRequest) {
  try {
    const cleanedSessions = await cleanupExpiredSessions();

    return NextResponse.json({
      success: true,
      cleanedSessions,
      timestamp: new Date().toISOString(),
      message: "Manual session cleanup completed",
    });
  } catch (error) {
    console.error("Manual session cleanup failed:", error);
    return NextResponse.json(
      { error: "Manual cleanup failed" },
      { status: 500 }
    );
  }
}
