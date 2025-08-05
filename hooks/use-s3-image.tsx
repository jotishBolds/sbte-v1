// hooks/use-s3-image.tsx
// Hook to handle S3 image URLs and provide fallback

import React, { useState, useEffect } from "react";
import { extractS3KeyFromUrl } from "@/lib/s3-utils";

interface UseS3ImageProps {
  s3Url?: string | null;
  fallbackUrl?: string;
}

interface UseS3ImageReturn {
  imageUrl: string;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useS3Image({
  s3Url,
  fallbackUrl = "/placeholder-avatar.png",
}: UseS3ImageProps): UseS3ImageReturn {
  const [imageUrl, setImageUrl] = useState<string>(fallbackUrl);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadImage = async () => {
    if (!s3Url) {
      setImageUrl(fallbackUrl);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if it's already a local proxy URL
      if (s3Url.startsWith("/api/images")) {
        setImageUrl(s3Url);
        return;
      }

      // If it's an S3 URL, extract the key and create proxy URL
      if (s3Url.includes("amazonaws.com")) {
        const key = extractS3KeyFromUrl(s3Url);
        const proxyUrl = `/api/images?key=${encodeURIComponent(key)}`;

        // Test if the image is accessible
        const testImage = new Image();
        testImage.onload = () => {
          setImageUrl(proxyUrl);
          setIsLoading(false);
        };
        testImage.onerror = () => {
          console.warn("Failed to load S3 image:", s3Url);
          setImageUrl(fallbackUrl);
          setError("Failed to load image");
          setIsLoading(false);
        };
        testImage.src = proxyUrl;
      } else {
        // Direct URL, use as-is
        setImageUrl(s3Url);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error processing S3 image URL:", err);
      setImageUrl(fallbackUrl);
      setError("Error processing image URL");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImage();
  }, [s3Url, fallbackUrl]);

  const retry = () => {
    loadImage();
  };

  return {
    imageUrl,
    isLoading,
    error,
    retry,
  };
}

// Component wrapper for S3 images
interface S3ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError"> {
  s3Url?: string | null;
  fallbackUrl?: string;
  onLoadingChange?: (loading: boolean) => void;
  onImageError?: (error: string | null) => void;
}

export function S3Image({
  s3Url,
  fallbackUrl,
  onLoadingChange,
  onImageError,
  className,
  alt,
  ...props
}: S3ImageProps) {
  const { imageUrl, isLoading, error } = useS3Image({ s3Url, fallbackUrl });

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    onImageError?.(error);
  }, [error, onImageError]);

  return (
    <img
      {...props}
      src={imageUrl}
      alt={alt || "Image"}
      className={className}
      loading="lazy"
    />
  );
}
