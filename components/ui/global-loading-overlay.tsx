"use client";

import React from "react";
import { useLoading } from "@/contexts/loading-context";
import { Loader2 } from "lucide-react";

export const GlobalLoadingOverlay: React.FC = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4 min-w-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {loadingMessage}
        </p>
      </div>
    </div>
  );
};
