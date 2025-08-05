export interface SessionEvent {
  type: "SESSION_TERMINATED" | "SESSION_INVALIDATED" | "NEW_SESSION_STARTED";
  userId: string;
  timestamp: number;
  data?: any;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  lastActivity: number;
  tabId: string;
}

class SessionBroadcaster {
  private userId: string | null = null;
  private tabId: string;
  private listeners: Set<(event: SessionEvent) => void> = new Set();
  private storageKey = "sbte-session-broadcast";

  constructor() {
    this.tabId = Math.random().toString(36).substring(2, 15);

    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent.bind(this));
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  addListener(callback: (event: SessionEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  broadcast(event: SessionEvent) {
    if (typeof window === "undefined") return;

    try {
      const eventData = {
        ...event,
        tabId: this.tabId,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(eventData));

      // Clear the item immediately to trigger storage event
      setTimeout(() => {
        localStorage.removeItem(this.storageKey);
      }, 100);
    } catch (error) {
      console.error("Failed to broadcast session event:", error);
    }
  }

  private handleStorageEvent(e: StorageEvent) {
    if (e.key !== this.storageKey || !e.newValue) return;

    try {
      const event: SessionEvent & { tabId: string } = JSON.parse(e.newValue);

      // Don't process events from this tab
      if (event.tabId === this.tabId) return;

      // Only process events for this user
      if (this.userId && event.userId !== this.userId) return;

      // Notify all listeners
      this.listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("Error in session event listener:", error);
        }
      });
    } catch (error) {
      console.error("Failed to parse session event:", error);
    }
  }

  terminateAllSessions(userId: string) {
    this.broadcast({
      type: "SESSION_TERMINATED",
      userId,
      timestamp: Date.now(),
    });
  }

  invalidateSession(userId: string) {
    this.broadcast({
      type: "SESSION_INVALIDATED",
      userId,
      timestamp: Date.now(),
    });
  }

  announceNewSession(userId: string) {
    this.broadcast({
      type: "NEW_SESSION_STARTED",
      userId,
      timestamp: Date.now(),
    });
  }

  cleanup() {
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageEvent.bind(this));
    }
    this.listeners.clear();
  }
}

export const sessionBroadcaster = new SessionBroadcaster();
