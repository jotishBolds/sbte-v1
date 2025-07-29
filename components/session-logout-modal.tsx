import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut, Shield } from "lucide-react";

interface SessionLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail?: string;
  lastActivity?: string;
  isLoading?: boolean;
}

const SessionLogoutModal: React.FC<SessionLogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  lastActivity,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const formatLastActivity = (activity: string) => {
    try {
      return new Date(activity).toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96 max-w-[90vw]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Active Session Detected
            </h2>
          </div>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Security Notice
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            You are already logged in on another device or browser. For security
            reasons, only one active session is allowed per account.
          </p>
        </div>

        {userEmail && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <strong>Account:</strong> {userEmail}
            </p>
            {lastActivity && (
              <p>
                <strong>Last Activity:</strong>{" "}
                {formatLastActivity(lastActivity)}
              </p>
            )}
          </div>
        )}

        <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">
          To continue logging in on this device, we&apos;ll need to log out your
          other session. This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Logging out...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Log Out Other Session</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionLogoutModal;
