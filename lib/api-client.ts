// lib/api-client.ts
// Utility for making API requests with proper cache-busting and loading states

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Enhanced fetch function with cache-busting and error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, cache = "no-store" } = options;

  // Add cache-busting timestamp for GET requests
  const finalUrl =
    method === "GET"
      ? `${url}${url.includes("?") ? "&" : "?"}_t=${Date.now()}`
      : url;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    ...headers,
  };

  try {
    const response = await fetch(finalUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      cache,
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        error: errorData || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      status: 500,
    };
  }
}

/**
 * Hook for managing loading states with API requests
 */
import { useState, useCallback } from "react";

export function useApiRequest<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (url: string, options: ApiRequestOptions = {}) => {
      setLoading(true);
      setError(null);

      const response = await apiRequest<T>(url, options);

      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data || null);
        setError(null);
      }

      setLoading(false);
      return response;
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

/**
 * Specialized hook for data fetching with automatic loading management
 */
export function useFetch<T = any>(
  url: string,
  options: ApiRequestOptions = {}
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await apiRequest<T>(url, options);

    if (response.error) {
      setError(response.error);
      setData(null);
    } else {
      setData(response.data || null);
      setError(null);
    }

    setLoading(false);
  }, [url, JSON.stringify(options)]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    data,
    refetch,
    fetchData,
  };
}
