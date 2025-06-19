import { PrismaClient } from "@prisma/client";
import prisma from "@/src/lib/prisma";
import { nanoid } from "nanoid";

export async function cleanupUserSession(userId: string) {
  try {
    // Update user's logged in status and clear session token
    await prisma.user.update({
      where: { id: userId },
      data: {
        isLoggedIn: false,
        lastLogout: new Date(),
        sessionToken: null,
      },
    });

    return true;
  } catch (error) {
    console.error("Error updating user login status:", error);
    return false;
  }
}

// Enhanced single session enforcement
export async function enforcesSingleSession(
  userId: string,
  newSessionToken?: string
) {
  try {
    const sessionToken = newSessionToken || nanoid(32);

    // First check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      console.error("User not found for session enforcement:", userId);
      return null;
    }

    // Update user with new session token, this will invalidate any other active sessions
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionToken,
        isLoggedIn: true,
        lastLoginAt: new Date(),
      },
    });

    return sessionToken;
  } catch (error) {
    console.error("Error enforcing single session:", error);
    return null;
  }
}

// Validate session token
export async function validateSessionToken(
  userId: string,
  sessionToken: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sessionToken: true, isLoggedIn: true },
    });

    return user?.isLoggedIn === true && user?.sessionToken === sessionToken;
  } catch (error) {
    console.error("Error validating session token:", error);
    return false;
  }
}

// Cleanup expired sessions (can be called periodically)
export async function cleanupExpiredSessions() {
  try {
    const expiredTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    await prisma.user.updateMany({
      where: {
        isLoggedIn: true,
        lastLoginAt: {
          lt: expiredTime,
        },
      },
      data: {
        isLoggedIn: false,
        sessionToken: null,
        lastLogout: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    return false;
  }
}
