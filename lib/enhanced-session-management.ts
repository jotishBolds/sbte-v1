import prisma from "@/src/lib/prisma";
import { nanoid } from "nanoid";
import { logAuditEvent, logSecurityEvent } from "./audit-logger";

// Session configuration
export const SESSION_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds
export const ACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes for inactivity timeout

export interface SessionInfo {
  sessionToken: string;
  sessionExpiresAt: Date;
  sessionCreatedAt: Date;
  sessionIpAddress: string;
  sessionUserAgent: string;
}

// Enhanced session management with security tracking
export async function createUserSession(
  userId: string,
  ipAddress: string,
  userAgent: string,
  terminateOtherSessions = true
): Promise<SessionInfo | null> {
  try {
    const sessionToken = nanoid(64); // Longer token for better security
    const sessionCreatedAt = new Date();
    const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION);

    // If enforcing single session, terminate other sessions first
    if (terminateOtherSessions) {
      await terminateAllUserSessions(userId, ipAddress, userAgent);
    }

    // Create new session
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionToken,
        sessionCreatedAt,
        sessionExpiresAt,
        sessionIpAddress: ipAddress,
        sessionUserAgent: userAgent,
        isLoggedIn: true,
        lastLoginAt: new Date(),
        lastActivity: new Date(),
      },
    });

    // Log session creation
    await logAuditEvent({
      userId,
      action: "SESSION_CREATED",
      resource: "USER_SESSION",
      details: `New session created with token: ${sessionToken.substring(
        0,
        8
      )}...`,
      ipAddress,
      userAgent,
      status: "SUCCESS",
      sessionId: sessionToken,
    });

    return {
      sessionToken,
      sessionExpiresAt,
      sessionCreatedAt,
      sessionIpAddress: ipAddress,
      sessionUserAgent: userAgent,
    };
  } catch (error) {
    console.error("Error creating user session:", error);
    return null;
  }
}

// Terminate all sessions for a user (for single session enforcement)
export async function terminateAllUserSessions(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sessionToken: true, isLoggedIn: true },
    });

    if (user?.sessionToken && user.isLoggedIn) {
      // Log session termination
      await logSecurityEvent({
        eventType: "CONCURRENT_SESSION_TERMINATED",
        userId,
        ipAddress,
        userAgent,
        details: "Previous session terminated due to new login",
        severity: "MEDIUM",
      });
    }

    // Clear session data
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionToken: null,
        sessionCreatedAt: null,
        sessionExpiresAt: null,
        sessionIpAddress: null,
        sessionUserAgent: null,
        isLoggedIn: false,
        lastLogout: new Date(),
      },
    });
  } catch (error) {
    console.error("Error terminating user sessions:", error);
  }
}

// Validate session and check for expiry/activity timeout
export async function validateUserSession(
  userId: string,
  sessionToken: string,
  ipAddress: string,
  userAgent: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        sessionToken: true,
        sessionExpiresAt: true,
        lastActivity: true,
        isLoggedIn: true,
        sessionIpAddress: true,
        sessionUserAgent: true,
      },
    });

    if (!user || !user.isLoggedIn) {
      return { valid: false, reason: "User not logged in" };
    }

    if (user.sessionToken !== sessionToken) {
      await logSecurityEvent({
        eventType: "INVALID_SESSION_TOKEN",
        userId,
        ipAddress,
        userAgent,
        details: "Session token mismatch detected",
        severity: "HIGH",
      });
      return { valid: false, reason: "Invalid session token" };
    }

    const now = new Date();

    // Check session expiry
    if (user.sessionExpiresAt && user.sessionExpiresAt < now) {
      await terminateUserSession(
        userId,
        ipAddress,
        userAgent,
        "Session expired"
      );
      return { valid: false, reason: "Session expired" };
    }

    // Check activity timeout
    if (user.lastActivity) {
      const timeSinceActivity = now.getTime() - user.lastActivity.getTime();
      if (timeSinceActivity > ACTIVITY_TIMEOUT) {
        await terminateUserSession(
          userId,
          ipAddress,
          userAgent,
          "Session timed out due to inactivity"
        );
        return { valid: false, reason: "Session timed out due to inactivity" };
      }
    }

    // Check for session hijacking (IP/User-Agent change)
    if (
      user.sessionIpAddress !== ipAddress ||
      user.sessionUserAgent !== userAgent
    ) {
      await logSecurityEvent({
        eventType: "POTENTIAL_SESSION_HIJACKING",
        userId,
        ipAddress,
        userAgent,
        details: `Session IP/UA change detected. Original: ${user.sessionIpAddress}/${user.sessionUserAgent}, Current: ${ipAddress}/${userAgent}`,
        severity: "CRITICAL",
      });

      await terminateUserSession(
        userId,
        ipAddress,
        userAgent,
        "Potential session hijacking detected"
      );
      return { valid: false, reason: "Session security violation" };
    }

    // Update last activity
    await updateUserActivity(userId);

    return { valid: true };
  } catch (error) {
    console.error("Error validating user session:", error);
    return { valid: false, reason: "Session validation error" };
  }
}

// Update user's last activity timestamp
export async function updateUserActivity(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastActivity: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating user activity:", error);
  }
}

// Terminate a specific user session
export async function terminateUserSession(
  userId: string,
  ipAddress: string,
  userAgent: string,
  reason?: string
): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionToken: null,
        sessionCreatedAt: null,
        sessionExpiresAt: null,
        sessionIpAddress: null,
        sessionUserAgent: null,
        isLoggedIn: false,
        lastLogout: new Date(),
      },
    });

    await logAuditEvent({
      userId,
      action: "SESSION_TERMINATED",
      resource: "USER_SESSION",
      details: reason || "Session terminated",
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error terminating user session:", error);
  }
}

// Cleanup expired sessions (run periodically)
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const now = new Date();
    const expiredUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            sessionExpiresAt: {
              lt: now,
            },
          },
          {
            lastActivity: {
              lt: new Date(Date.now() - ACTIVITY_TIMEOUT),
            },
          },
        ],
        isLoggedIn: true,
      },
      select: { id: true, sessionToken: true },
    });

    if (expiredUsers.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: {
            in: expiredUsers.map((u) => u.id),
          },
        },
        data: {
          sessionToken: null,
          sessionCreatedAt: null,
          sessionExpiresAt: null,
          sessionIpAddress: null,
          sessionUserAgent: null,
          isLoggedIn: false,
          lastLogout: new Date(),
        },
      });

      // Log cleanup
      await logAuditEvent({
        action: "BULK_SESSION_CLEANUP",
        resource: "USER_SESSION",
        details: `Cleaned up ${expiredUsers.length} expired sessions`,
        ipAddress: "system",
        userAgent: "system",
        status: "SUCCESS",
      });
    }

    return expiredUsers.length;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    return 0;
  }
}

// Get session information
export async function getSessionInfo(
  userId: string
): Promise<SessionInfo | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        sessionToken: true,
        sessionCreatedAt: true,
        sessionExpiresAt: true,
        sessionIpAddress: true,
        sessionUserAgent: true,
        isLoggedIn: true,
      },
    });

    if (!user?.isLoggedIn || !user.sessionToken) {
      return null;
    }

    return {
      sessionToken: user.sessionToken,
      sessionCreatedAt: user.sessionCreatedAt!,
      sessionExpiresAt: user.sessionExpiresAt!,
      sessionIpAddress: user.sessionIpAddress!,
      sessionUserAgent: user.sessionUserAgent!,
    };
  } catch (error) {
    console.error("Error getting session info:", error);
    return null;
  }
}

// Check if user has active session elsewhere
export async function hasActiveSessionElsewhere(
  userId: string,
  currentSessionToken: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        sessionToken: true,
        isLoggedIn: true,
      },
    });

    return (
      user?.isLoggedIn === true &&
      user.sessionToken !== null &&
      user.sessionToken !== currentSessionToken
    );
  } catch (error) {
    console.error("Error checking for active sessions:", error);
    return false;
  }
}

// Get all active sessions for a user
export async function getUserActiveSessions(
  userId: string
): Promise<SessionInfo[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        sessionToken: true,
        sessionCreatedAt: true,
        sessionExpiresAt: true,
        sessionIpAddress: true,
        sessionUserAgent: true,
        isLoggedIn: true,
      },
    });

    if (!user || !user.isLoggedIn || !user.sessionToken) {
      return [];
    }

    return [
      {
        sessionToken: user.sessionToken,
        sessionCreatedAt: user.sessionCreatedAt || new Date(),
        sessionExpiresAt: user.sessionExpiresAt || new Date(),
        sessionIpAddress: user.sessionIpAddress || "unknown",
        sessionUserAgent: user.sessionUserAgent || "unknown",
      },
    ];
  } catch (error) {
    console.error("Error getting user active sessions:", error);
    return [];
  }
}
