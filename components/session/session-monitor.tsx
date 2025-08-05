"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { sessionBroadcaster, SessionEvent } from "@/lib/session-broadcast";

interface SessionMonitorProps {
  children: React.ReactNode;
}

export function SessionMonitor({ children }: SessionMonitorProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const securityAlertShownRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const checkIntervalRef = useRef<NodeJS.Timeout>();

  // Session timeout configuration (60 minutes)
  const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout
  const CHECK_INTERVAL = 15 * 1000; // Check every 15 seconds (more frequent)
  const isRedirectingRef = useRef<boolean>(false);

  // Public routes that don't need session monitoring (matching middleware.ts)
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/contact",
    "/about-us",
    "/organization-chart",
    "/who-is-who",
    "/affiliated-collages",
    "/convocations",
    "/notification-circulation",
    "/gallery",
    "/register-alumni",
    "/support",
    "/sentry-example-page",
    "/auth-debug",
    "/subjects-",
    "/fee",
    "/privacy",
    "/terms",
    "/Organization-Chart",
    "/forbidden",
    "/session-reset",
    // Pages under (pages) group
    "/pages/about-us",
    "/pages/contact",
    "/pages/affiliated-collages",
    "/pages/convocations",
    "/pages/gallery",
    "/pages/notification-circulation",
    "/pages/organization-chart",
    "/pages/report-generate",
    "/pages/who-is-who",
  ];

  // Public route prefixes that don't need session monitoring
  const publicRoutePrefixes = [
    "/Convocation1/",
    "/Convocation2/",
    "/Convocation3/",
    "/home/",
    "/notification-pdf/",
    "/students-images/",
    "/templates/",
    "/uploads/",
    "/_next/",
    "/api/images",
  ];

  // Check if current route is public
  const normalizePath = (path: string) =>
    path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  const normalizedPath = normalizePath(pathname);

  const isPublicRoute =
    publicRoutes.includes(normalizedPath) ||
    publicRoutePrefixes.some((prefix) => normalizedPath.startsWith(prefix));

  console.log(
    "SessionMonitor - pathname:",
    pathname,
    "normalizedPath:",
    normalizedPath,
    "isPublicRoute:",
    isPublicRoute,
    "status:",
    status
  );

  // Handle case when session becomes null or invalid
  useEffect(() => {
    // Skip session monitoring for public routes
    if (isPublicRoute) {
      console.log("Skipping session monitoring on public route:", pathname);
      return;
    }

    if (status === "loading" || isRedirectingRef.current) {
      return; // Still loading or already redirecting, don't take action
    }

    if (status === "unauthenticated" || !session || !session.user) {
      // Session is null, expired, or user is null - redirect to login
      console.log("Session is null or invalid, redirecting to login");
      isRedirectingRef.current = true;
      window.location.href = "/login?reason=session_invalid";
      return;
    }

    // Set user ID for session broadcaster
    if (session?.user?.id) {
      sessionBroadcaster.setUserId(session.user.id);
    }
  }, [session, status, isPublicRoute, pathname]);

  // Real-time session broadcasting listener (for concurrent session prevention)
  useEffect(() => {
    // Skip on public routes or if not authenticated
    if (isPublicRoute || status !== "authenticated" || !session?.user?.id) {
      return;
    }

    const handleSessionEvent = async (event: SessionEvent) => {
      if (isRedirectingRef.current) return;

      console.log("Received session event:", event);

      switch (event.type) {
        case "SESSION_TERMINATED":
          console.log("Session terminated by another tab, logging out");
          isRedirectingRef.current = true;
          window.location.href = "/login?reason=session_terminated";
          break;

        case "SESSION_INVALIDATED":
          console.log("Session invalidated, redirecting to forbidden");
          isRedirectingRef.current = true;
          window.location.href = "/forbidden?reason=security_violation";
          break;
      }
    };

    const removeListener = sessionBroadcaster.addListener(handleSessionEvent);
    return removeListener;
  }, [session, status, isPublicRoute]);

  // Session timeout and activity monitoring (only on protected routes)
  useEffect(() => {
    // Skip session timeout monitoring for public routes
    if (isPublicRoute || status !== "authenticated" || !session?.user?.id) {
      return;
    }

    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    securityAlertShownRef.current = false;

    // Activity events to track
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Update last activity time
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      warningShownRef.current = false; // Reset warning flag on activity
    };

    // Add activity listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Server session validation
    const checkServerSession = async () => {
      try {
        const response = await fetch("/api/auth/session-validation", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          console.log("Server session validation failed");
          isRedirectingRef.current = true;
          window.location.href = "/login?reason=session_invalid";
        }
      } catch (error) {
        console.error("Session validation error:", error);
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
  }, [session, status, isPublicRoute]);

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
    if (typeof window !== "undefined") {
      const shouldExtend = window.confirm(
        `Your session will expire in ${minutesLeft} minute(s). Do you want to extend your session?`
      );

      if (shouldExtend) {
        // Reset activity to extend session
        lastActivityRef.current = Date.now();
        warningShownRef.current = false;
      } else {
        // User chose not to extend, log them out
        handleSessionExpired();
      }
    }
  };

  return <>{children}</>;
}
