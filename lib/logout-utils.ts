import { signOut } from "next-auth/react";
import { sessionBroadcaster } from "./session-broadcast";

export async function performLogout(
  userId?: string,
  reason: string = "user_logout",
  callbackUrl: string = "/login"
) {
  try {
    // Broadcast session termination to other tabs
    if (userId) {
      sessionBroadcaster.terminateAllSessions(userId);
    }

    // Sign out using NextAuth
    await signOut({
      callbackUrl: `${callbackUrl}?reason=${reason}`,
      redirect: true,
    });
  } catch (error) {
    console.error("Error during logout:", error);
    // Fallback to redirect
    window.location.href = `${callbackUrl}?reason=${reason}`;
  }
}

export async function performSecurityLogout(userId?: string) {
  return performLogout(userId, "security_violation", "/forbidden");
}

export async function performTimeoutLogout(userId?: string) {
  return performLogout(userId, "session_expired", "/login");
}
