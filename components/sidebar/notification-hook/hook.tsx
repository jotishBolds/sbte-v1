import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { ExtendedNotification } from "@/types/types";
import { PrismaClient } from "@prisma/client";

// Connection management singleton
const prismaManager = {
  client: null as PrismaClient | null,
  connectionsInUse: 0,
  MAX_CONNECTIONS: 10,
  COOLDOWN_PERIOD: 5000, // 5 seconds

  async getClient() {
    if (!this.client) {
      this.client = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: ["error"],
      });
    }
    return this.client;
  },

  async acquire() {
    if (this.connectionsInUse >= this.MAX_CONNECTIONS) {
      throw new Error("Connection pool exhausted");
    }
    this.connectionsInUse++;
    return await this.getClient();
  },

  release() {
    if (this.connectionsInUse > 0) {
      this.connectionsInUse--;
    }
  },

  async disconnect() {
    if (this.client) {
      await this.client.$disconnect();
      this.client = null;
      this.connectionsInUse = 0;
    }
  },
};

interface NotificationDownloadProps {
  id: string;
  title: string;
}

class NotificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationError";
  }
}

interface NotificationManagerReturn {
  notifications: ExtendedNotification[];
  notificationCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  downloadNotification: (props: NotificationDownloadProps) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationManager = (): NotificationManagerReturn => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<ExtendedNotification[]>(
    []
  );
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const lastFetchTime = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const FETCH_COOLDOWN = 30000;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const notificationEnabledRoles = useMemo(
    () => ["SBTE_ADMIN", "COLLEGE_SUPER_ADMIN"] as const,
    []
  );

  type NotificationRole = (typeof notificationEnabledRoles)[number];

  const isRoleEnabled = useMemo(() => {
    const userRole = session?.user?.role as NotificationRole | undefined;
    return userRole && notificationEnabledRoles.includes(userRole);
  }, [session?.user?.role, notificationEnabledRoles]);

  const computeNotificationCount = useCallback(
    (data: ExtendedNotification[]): number => {
      if (!session?.user?.role) return 0;
      if (!data || data.length === 0) return 0;

      const role = session.user.role as NotificationRole;

      if (role === "SBTE_ADMIN") {
        return data.length || 0;
      }

      if (role === "COLLEGE_SUPER_ADMIN" && session.user.collegeId) {
        return data.filter((notif) =>
          notif.notifiedColleges?.some(
            (college) =>
              college.collegeId === session.user.collegeId && !college.isRead
          )
        ).length;
      }

      return 0;
    },
    [session?.user?.role, session?.user?.collegeId]
  );

  const fetchNotificationsWithRetry = async (
    retryCount = 0
  ): Promise<ExtendedNotification[]> => {
    try {
      const response = await fetch("/api/notification", {
        signal: abortControllerRef.current?.signal,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        throw new NotificationError(
          `Failed to fetch notifications: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle the case where the API returns a message instead of an array
      if (!Array.isArray(data)) {
        if (data && data.message === "No notifications found.") {
          console.log("No notifications found");
          return []; // Return an empty array for the message response
        }
        console.warn("Unexpected notification response format:", data);
        return [];
      }

      return data;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("too many clients") &&
        retryCount < MAX_RETRIES
      ) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return fetchNotificationsWithRetry(retryCount + 1);
      }
      throw error;
    }
  };

  const fetchNotifications = useCallback(
    async (force = false): Promise<void> => {
      if (!isRoleEnabled) {
        setLoading(false);
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchTime.current < FETCH_COOLDOWN) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        lastFetchTime.current = now;

        const data = await fetchNotificationsWithRetry();

        // Always update the state with the fetched data, even if it's an empty array
        setNotifications(data);

        // Compute notification count based on the fetched data
        const newCount = computeNotificationCount(data);
        setNotificationCount(newCount);

        console.log("Fetched notifications:", data.length, "Count:", newCount);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching notifications:", errorMessage);

        toast({
          title: "Error",
          description: "Failed to load notifications. Retrying...",
          variant: "destructive",
        });

        // Schedule retry
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          void fetchNotifications(true);
        }, RETRY_DELAY);

        setNotificationCount(0);
      } finally {
        setLoading(false);
      }
    },
    [isRoleEnabled, computeNotificationCount]
  );

  const downloadNotification = useCallback(
    async ({ id, title }: NotificationDownloadProps): Promise<void> => {
      try {
        const response = await fetch(`/api/notification/${id}`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (!response.ok) {
          throw new NotificationError("Failed to download notification");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        // If the user is COLLEGE_SUPER_ADMIN, mark notification as read
        if (
          session?.user?.role === "COLLEGE_SUPER_ADMIN" &&
          session.user.collegeId
        ) {
          await markAsRead(id);
        }

        await fetchNotifications(true);

        toast({
          title: "Success",
          description: "Notification downloaded successfully",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error downloading notification:", errorMessage);

        toast({
          title: "Error",
          description: "Failed to download notification",
          variant: "destructive",
        });
      }
    },
    [fetchNotifications, session]
  );

  const markAsRead = useCallback(
    async (id: string): Promise<void> => {
      if (
        session?.user?.role !== "COLLEGE_SUPER_ADMIN" ||
        !session?.user?.collegeId
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/notification/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new NotificationError("Failed to mark notification as read");
        }

        // Update the local state to reflect the notification was read
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) => {
            if (notif.id === id) {
              return {
                ...notif,
                notifiedColleges: notif.notifiedColleges?.map((college) => {
                  if (college.collegeId === session.user?.collegeId) {
                    return { ...college, isRead: true };
                  }
                  return college;
                }),
              };
            }
            return notif;
          })
        );

        // Recalculate notification count
        setNotificationCount((prev) => (prev > 0 ? prev - 1 : 0));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error marking notification as read:", errorMessage);
      }
    },
    [session]
  );

  useEffect(() => {
    if (isRoleEnabled) {
      void fetchNotifications(true);

      const intervalId = setInterval(() => {
        void fetchNotifications();
      }, 5 * 60 * 1000);

      return () => {
        clearInterval(intervalId);
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        void prismaManager.disconnect();
      };
    }
  }, [isRoleEnabled, fetchNotifications]);

  return {
    notifications,
    notificationCount,
    loading,
    fetchNotifications: () => fetchNotifications(true),
    downloadNotification,
    markAsRead,
  };
};
