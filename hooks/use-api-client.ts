"use client";

import { useLoading } from "@/contexts/loading-context";
import { useCallback } from "react";

interface ApiRequestOptions extends RequestInit {
  showLoading?: boolean;
  loadingMessage?: string;
}

export const useApiClient = () => {
  const { setLoading } = useLoading();

  const apiRequest = useCallback(
    async <T = any>(
      url: string,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      const {
        showLoading = true,
        loadingMessage = "Loading...",
        ...fetchOptions
      } = options;

      try {
        if (showLoading) {
          setLoading(true, loadingMessage);
        }

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
          ...fetchOptions,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              errorData.error ||
              `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [setLoading]
  );

  const get = useCallback(
    <T = any>(url: string, options: Omit<ApiRequestOptions, "method"> = {}) =>
      apiRequest<T>(url, { ...options, method: "GET" }),
    [apiRequest]
  );

  const post = useCallback(
    <T = any>(
      url: string,
      data?: any,
      options: Omit<ApiRequestOptions, "method" | "body"> = {}
    ) =>
      apiRequest<T>(url, {
        ...options,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiRequest]
  );

  const put = useCallback(
    <T = any>(
      url: string,
      data?: any,
      options: Omit<ApiRequestOptions, "method" | "body"> = {}
    ) =>
      apiRequest<T>(url, {
        ...options,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiRequest]
  );

  const del = useCallback(
    <T = any>(url: string, options: Omit<ApiRequestOptions, "method"> = {}) =>
      apiRequest<T>(url, { ...options, method: "DELETE" }),
    [apiRequest]
  );

  return { get, post, put, delete: del };
};

export default useApiClient;
