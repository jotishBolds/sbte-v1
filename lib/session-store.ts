// Enhanced session state management to fix concurrent login issues
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CaptchaState {
  answer: string;
  expected: string;
  expiresAt: string;
  isValid: boolean;
  userEmail?: string;
}

interface SessionState {
  // CAPTCHA state preservation
  captcha: CaptchaState | null;

  // Session management
  isLoggingOut: boolean;
  lastActivity: number;
  sessionId: string | null;

  // User state
  currentUser: {
    email: string;
    id: string;
    role: string;
  } | null;

  // Actions
  setCaptcha: (captcha: CaptchaState) => void;
  clearCaptcha: () => void;
  preserveCaptcha: (email: string) => void;

  setLoggingOut: (isLoggingOut: boolean) => void;
  updateActivity: () => void;
  setSessionId: (sessionId: string | null) => void;
  setCurrentUser: (user: SessionState["currentUser"]) => void;

  // Session actions
  cleanupSession: () => void;
  resetState: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      captcha: null,
      isLoggingOut: false,
      lastActivity: Date.now(),
      sessionId: null,
      currentUser: null,

      // CAPTCHA management
      setCaptcha: (captcha: CaptchaState) => {
        set({ captcha });
      },

      clearCaptcha: () => {
        set({ captcha: null });
      },

      preserveCaptcha: (email: string) => {
        const { captcha } = get();
        if (captcha && captcha.userEmail === email) {
          // Keep CAPTCHA if it's for the same user and still valid
          const now = Date.now();
          const expiresAt = new Date(captcha.expiresAt).getTime();
          if (now < expiresAt) {
            // CAPTCHA is still valid, keep it
            return;
          }
        }
        // Clear invalid or mismatched CAPTCHA
        set({ captcha: null });
      },

      // Session management
      setLoggingOut: (isLoggingOut: boolean) => {
        set({ isLoggingOut });
      },

      updateActivity: () => {
        set({ lastActivity: Date.now() });
      },

      setSessionId: (sessionId: string | null) => {
        set({ sessionId });
      },

      setCurrentUser: (user: SessionState["currentUser"]) => {
        set({ currentUser: user });
      },

      // Cleanup functions
      cleanupSession: () => {
        set({
          sessionId: null,
          currentUser: null,
          isLoggingOut: false,
          lastActivity: Date.now(),
        });
        // Preserve CAPTCHA during session cleanup
      },

      resetState: () => {
        set({
          captcha: null,
          isLoggingOut: false,
          lastActivity: Date.now(),
          sessionId: null,
          currentUser: null,
        });
      },
    }),
    {
      name: "sbte-session-store",
      partialize: (state: SessionState) => ({
        // Only persist CAPTCHA and basic session info
        captcha: state.captcha,
        lastActivity: state.lastActivity,
        sessionId: state.sessionId,
      }),
      version: 1,
    }
  )
);

// Session management utilities
export const sessionUtils = {
  // Check if CAPTCHA is valid for user
  isCaptchaValidForUser: (email: string): boolean => {
    const { captcha } = useSessionStore.getState();
    if (!captcha || captcha.userEmail !== email) {
      return false;
    }

    const now = Date.now();
    const expiresAt = new Date(captcha.expiresAt).getTime();
    return now < expiresAt && captcha.isValid;
  },

  // Preserve CAPTCHA during logout modal
  preserveCaptchaOnLogout: (email: string) => {
    const store = useSessionStore.getState();
    store.preserveCaptcha(email);
  },

  // Clear session but preserve CAPTCHA
  cleanupSessionOnly: () => {
    const store = useSessionStore.getState();
    store.cleanupSession();
  },

  // Complete reset including CAPTCHA
  fullReset: () => {
    const store = useSessionStore.getState();
    store.resetState();
  },

  // Update user activity
  recordActivity: () => {
    const store = useSessionStore.getState();
    store.updateActivity();
  },

  // Check if session is active
  isSessionActive: (): boolean => {
    const { sessionId, currentUser, lastActivity } = useSessionStore.getState();
    const now = Date.now();
    const maxInactivity = 60 * 60 * 1000; // 1 hour

    return !!(sessionId && currentUser && now - lastActivity < maxInactivity);
  },
};

export default useSessionStore;
