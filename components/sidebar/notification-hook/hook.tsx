import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { ExtendedNotification } from "@/types/types";

// Type definitions for clarity
interface NotificationDownloadProps {
  id: string;
  title: string;
}

export const useNotificationManager = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<ExtendedNotification[]>(
    []
  );
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Memoize notification-enabled roles to prevent unnecessary re-creation
  const notificationEnabledRoles = useMemo(
    () => ["SBTE_ADMIN", "COLLEGE_SUPER_ADMIN"],
    []
  );

  // Optimize fetch notifications with useCallback
  const fetchNotifications = useCallback(async () => {
    // Early return if role is not permitted
    if (
      !session?.user?.role ||
      !notificationEnabledRoles.includes(session.user.role)
    ) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/notification", {
        // Add cache-busting to prevent over-caching
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      // Use functional state update to ensure latest state
      setNotifications((prevNotifications) => {
        // Only update if data has changed to prevent unnecessary re-renders
        const hasChanged =
          JSON.stringify(prevNotifications) !== JSON.stringify(data);
        return hasChanged ? data : prevNotifications;
      });

      // Optimize notification count calculation
      const computeNotificationCount = () => {
        if (session.user.role === "SBTE_ADMIN") {
          return data.length || 0;
        }

        if (session.user.role === "COLLEGE_SUPER_ADMIN") {
          if (data.message == "No notifications found.") {
            return;
          } else {
            return data.filter((notif: ExtendedNotification) =>
              notif.notifiedColleges.some(
                (college) =>
                  college.collegeId === session.user.collegeId &&
                  !college.isRead
              )
            ).length;
          }
        }

        return 0;
      };

      setNotificationCount((prevCount) => {
        const newCount = computeNotificationCount();
        return prevCount !== newCount ? newCount : prevCount;
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
      setNotificationCount(0);
    } finally {
      setLoading(false);
    }
  }, [session, notificationEnabledRoles]);

  // Optimize download notification with useCallback
  const downloadNotification = useCallback(
    async ({ id, title }: NotificationDownloadProps) => {
      try {
        const response = await fetch(`/api/notification/${id}`);

        if (!response.ok) {
          throw new Error("Failed to download notification");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Refresh notifications to update count
        await fetchNotifications();

        toast({
          title: "Success",
          description: "Notification downloaded successfully",
        });
      } catch (error) {
        console.error("Error downloading notification:", error);
        toast({
          title: "Error",
          description: "Failed to download notification",
          variant: "destructive",
        });
      }
    },
    [fetchNotifications]
  );

  // Optimize initial fetch and polling with useEffect
  useEffect(() => {
    // Only set up polling if a valid session exists
    if (
      session?.user?.role &&
      notificationEnabledRoles.includes(session.user.role)
    ) {
      // Fetch immediately
      fetchNotifications();

      // Set up polling every 5 minutes
      const intervalId = setInterval(fetchNotifications, 5 * 60 * 1000);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [session, notificationEnabledRoles, fetchNotifications]);

  // Return hook values and methods
  return {
    notifications,
    notificationCount,
    loading,
    fetchNotifications,
    downloadNotification,
  };
};
