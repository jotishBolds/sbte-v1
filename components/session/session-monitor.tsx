"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SessionMonitorProps {
  children: React.ReactNode;
}

export function SessionMonitor({ children }: SessionMonitorProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const securityAlertShownRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const checkIntervalRef = useRef<NodeJS.Timeout>();

  // Session timeout configuration (60 minutes)
  const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout
  const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds (more frequent)

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      return;
    }

    // Update activity timestamp on user interaction
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      warningShownRef.current = false;
    };

    // Events that indicate user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners for user activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Function to check session validity on server
    const checkServerSession = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/auth/session-validation", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          console.log("Server session validation failed, logging out");
          await signOut({ callbackUrl: "/login" });
          return;
        }

        const sessionData = await response.json();
        if (!sessionData.valid) {
          console.log("Session marked as invalid by server, logging out");
          await signOut({ callbackUrl: "/login" });
          return;
        }
      } catch (error) {
        console.error("Error checking server session:", error);
        // Don't log out on network errors, only on explicit invalidation
      }
    };

    // Function to check session timeout
    const checkSessionTimeout = async () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const timeUntilTimeout = SESSION_TIMEOUT - timeSinceActivity;

      // Check server session validity first
      await checkServerSession();

      if (timeSinceActivity >= SESSION_TIMEOUT) {
        // Session has expired
        handleSessionExpired();
      } else if (timeUntilTimeout <= WARNING_TIME && !warningShownRef.current) {
        // Show warning
        showTimeoutWarning(Math.ceil(timeUntilTimeout / 1000 / 60));
        warningShownRef.current = true;
      }
    };

    // Start checking session timeout
    checkIntervalRef.current = setInterval(checkSessionTimeout, CHECK_INTERVAL);

    // Cleanup function
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session, status, router]);

  const handleSessionExpired = async () => {
    try {
      // Log session expiry
      await fetch("/api/auth/session-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          reason: "Session expired due to inactivity",
        }),
      });
    } catch (error) {
      console.error("Error during session cleanup:", error);
    }

    // Sign out and redirect
    await signOut({
      callbackUrl: "/login?reason=session_expired",
      redirect: true,
    });
  };

  const showTimeoutWarning = (minutesLeft: number) => {
    const shouldExtend = confirm(
      `Your session will expire in ${minutesLeft} minute(s) due to inactivity. ` +
        "Click OK to extend your session, or Cancel to log out now."
    );

    if (shouldExtend) {
      // Extend session by updating activity
      lastActivityRef.current = Date.now();
      warningShownRef.current = false;
    } else {
      handleSessionExpired();
    }
  };

  // Monitor for concurrent sessions
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    const checkConcurrentSessions = async () => {
      try {
        const response = await fetch("/api/auth/session-validation", {
          method: "GET",
          headers: {
            "X-Session-Token":
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("next-auth.session-token="))
                ?.split("=")[1] || "",
          },
        });

        if (!response.ok) {
          const data = await response.json();
          if (
            (data.reason === "Invalid session token" ||
              data.reason === "Session security violation") &&
            !securityAlertShownRef.current
          ) {
            securityAlertShownRef.current = true;
            alert(
              "Your session has been terminated due to a security concern. Please log in again."
            );
            await signOut({
              callbackUrl: "/forbidden?reason=security_violation",
              redirect: true,
            });
          }
        }
      } catch (error) {
        console.error("Error checking concurrent sessions:", error);
      }
    };

    // Check for concurrent sessions every 2 minutes (reduced from 5 minutes)
    const concurrentCheckInterval = setInterval(
      checkConcurrentSessions,
      2 * 60 * 1000
    );

    return () => {
      clearInterval(concurrentCheckInterval);
    };
  }, [session, status]);

  return <>{children}</>;
}

// Hook for manual session extension
export function useSessionExtension() {
  const { data: session } = useSession();

  const extendSession = async () => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch("/api/auth/session-validation", {
        method: "GET",
        headers: {
          "X-Session-Token":
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("next-auth.session-token="))
              ?.split("=")[1] || "",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error extending session:", error);
      return false;
    }
  };

  return { extendSession };
}
