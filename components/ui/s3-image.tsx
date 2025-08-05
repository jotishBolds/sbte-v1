"use client";
import React from "react";
import { useS3Image } from "@/hooks/use-s3-image";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface S3ImageProps {
  s3Url?: string | null;
  alt: string;
  className?: string;
  fallbackUrl?: string;
  showRetry?: boolean;
  showLoadingState?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

export const S3Image: React.FC<S3ImageProps> = ({
  s3Url,
  alt,
  className,
  fallbackUrl,
  showRetry = true,
  showLoadingState = true,
  onError,
  onLoad,
}) => {
  const { imageUrl, isLoading, error, retry } = useS3Image({
    s3Url,
    fallbackUrl,
  });

  const handleImageLoad = () => {
    onLoad?.();
  };

  const handleImageError = () => {
    console.error("S3Image failed to load:", s3Url);
    onError?.();
  };

  const handleRetry = () => {
    retry();
  };

  if (isLoading && showLoadingState) {
    return <Skeleton className={cn("animate-pulse bg-muted", className)} />;
  }

  if (error && showRetry) {
    return (
      <div
        className={cn(
          "bg-muted rounded flex items-center justify-center flex-col p-4",
          className
        )}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <span className="text-xs text-muted-foreground mb-2">
          Failed to load
        </span>
        <button
          onClick={handleRetry}
          className="flex items-center text-xs text-blue-600 hover:underline"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};

// Avatar variant for profile pictures
export const S3Avatar: React.FC<S3ImageProps> = (props) => {
  return (
    <S3Image
      {...props}
      className={cn("rounded-full", props.className)}
      fallbackUrl={props.fallbackUrl || "/placeholder-avatar.png"}
    />
  );
};

// Logo variant for institution logos
export const S3Logo: React.FC<S3ImageProps> = (props) => {
  return (
    <S3Image
      {...props}
      className={cn("object-contain", props.className)}
      fallbackUrl={props.fallbackUrl || "/sbte-logo.png"}
    />
  );
};
