// Session management utilities wrapper
import {
  createUserSession,
  validateUserSession,
  terminateUserSession,
  terminateAllUserSessions,
  updateUserActivity,
  cleanupExpiredSessions,
  getUserActiveSessions,
  SESSION_DURATION,
  ACTIVITY_TIMEOUT,
} from "./enhanced-session-management";

// Session configuration constants
export const sessionConfig = {
  maxAge: SESSION_DURATION, // 60 minutes
  activityTimeout: ACTIVITY_TIMEOUT, // 60 minutes for inactivity
  maxSessions: 1, // Single session per user
  checkInterval: 5 * 60 * 1000, // Check every 5 minutes
};

// Session validation middleware
export async function validateSession(
  userId: string,
  sessionToken: string,
  ipAddress: string,
  userAgent: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const validation = await validateUserSession(
      userId,
      sessionToken,
      ipAddress,
      userAgent
    );

    if (validation.valid) {
      // Update activity if session is valid
      await updateUserActivity(userId);
      return { valid: true };
    }

    return { valid: false, reason: validation.reason };
  } catch (error) {
    console.error("Session validation error:", error);
    return { valid: false, reason: "Validation error" };
  }
}

// Create new session with security checks
export async function createSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ sessionToken: string; expiresAt: Date } | null> {
  try {
    const sessionInfo = await createUserSession(
      userId,
      ipAddress,
      userAgent,
      true // Terminate other sessions for single-session enforcement
    );

    if (sessionInfo) {
      return {
        sessionToken: sessionInfo.sessionToken,
        expiresAt: sessionInfo.sessionExpiresAt,
      };
    }

    return null;
  } catch (error) {
    console.error("Session creation error:", error);
    return null;
  }
}

// Terminate session
export async function destroySession(
  userId: string,
  sessionToken?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    await terminateUserSession(
      userId,
      ipAddress || "unknown",
      userAgent || "unknown",
      "Manual logout"
    );
    return true;
  } catch (error) {
    console.error("Session termination error:", error);
    return false;
  }
}

// Session cleanup utilities
export const sessionCleanup = {
  // Clean expired sessions
  cleanExpired: async (): Promise<number> => {
    try {
      return await cleanupExpiredSessions();
    } catch (error) {
      console.error("Session cleanup error:", error);
      return 0;
    }
  },

  // Get active sessions for user
  getActiveSessions: async (userId: string) => {
    try {
      return await getUserActiveSessions(userId);
    } catch (error) {
      console.error("Get active sessions error:", error);
      return [];
    }
  },

  // Terminate all sessions for user
  terminateAll: async (
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> => {
    try {
      await terminateAllUserSessions(
        userId,
        ipAddress || "unknown",
        userAgent || "unknown"
      );
      return true;
    } catch (error) {
      console.error("Terminate all sessions error:", error);
      return false;
    }
  },
};

// Session security checks
export const sessionSecurity = {
  // Check for suspicious activity
  checkSuspiciousActivity: (
    currentIp: string,
    currentUserAgent: string,
    sessionIp: string,
    sessionUserAgent: string
  ): { suspicious: boolean; reasons: string[] } => {
    const reasons: string[] = [];

    if (currentIp !== sessionIp) {
      reasons.push("IP address changed");
    }

    if (currentUserAgent !== sessionUserAgent) {
      reasons.push("User agent changed");
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  },

  // Validate session timing
  validateTiming: (
    sessionCreatedAt: Date,
    lastActivity: Date,
    currentTime: Date = new Date()
  ): { valid: boolean; reason?: string } => {
    const sessionAge = currentTime.getTime() - sessionCreatedAt.getTime();
    const inactivityTime = currentTime.getTime() - lastActivity.getTime();

    if (sessionAge > sessionConfig.maxAge) {
      return { valid: false, reason: "Session expired" };
    }

    if (inactivityTime > sessionConfig.activityTimeout) {
      return { valid: false, reason: "Session inactive too long" };
    }

    return { valid: true };
  },
};

export default {
  sessionConfig,
  validateSession,
  createSession,
  destroySession,
  sessionCleanup,
  sessionSecurity,
};
