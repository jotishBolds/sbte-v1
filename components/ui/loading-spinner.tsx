// components/ui/loading-spinner.tsx
// Reusable loading components with consistent styling

import React from "react";
import {
  ClipLoader,
  BeatLoader,
  PulseLoader as ReactPulseLoader,
} from "react-spinners";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

interface LoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

interface PageLoadingProps {
  message?: string;
  className?: string;
}

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: number;
  color?: string;
}

/**
 * Basic loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 30,
  color = "#4A90E2",
  className,
}) => {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <ClipLoader color={color} size={size} />
    </div>
  );
};

/**
 * Small loading spinner for buttons and inline use
 */
export const SmallLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 16,
  color = "#ffffff",
  className,
}) => {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <ClipLoader color={color} size={size} />
    </div>
  );
};

/**
 * Loading dots for subtle loading states
 */
export const LoadingDots: React.FC<LoadingSpinnerProps> = ({
  size = 8,
  color = "#4A90E2",
  className,
}) => {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <BeatLoader color={color} size={size} />
    </div>
  );
};

/**
 * Pulsing loader for minimal loading states
 */
export const PulsingLoader: React.FC<LoadingSpinnerProps> = ({
  size = 10,
  color = "#4A90E2",
  className,
}) => {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <ReactPulseLoader color={color} size={size} />
    </div>
  );
};

/**
 * Conditional loading state wrapper
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  children,
  fallback,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("min-h-[200px]", className)}>
        {fallback || <LoadingSpinner />}
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Full page loading component
 */
export const PageLoading: React.FC<PageLoadingProps> = ({
  message = "Loading...",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center min-h-[400px] space-y-4",
        className
      )}
    >
      <LoadingSpinner size={50} />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
};

/**
 * Button loading state
 */
export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  loadingText = "Loading...",
  size = 16,
  color = "#ffffff",
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <ClipLoader color={color} size={size} />
        <span>{loadingText}</span>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Table loading rows
 */
export const TableLoadingRows: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 5, cols = 4, className }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className={cn("animate-pulse", className)}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/**
 * Card loading skeleton
 */
export const CardLoadingSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 3, className }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 bg-gray-200 rounded"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
