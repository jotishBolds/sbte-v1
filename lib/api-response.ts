// lib/api-response.ts
// Utility for creating API responses with consistent cache-busting headers

import { NextResponse } from "next/server";

/**
 * Creates a NextResponse with cache-busting headers to prevent disk caching
 */
export function createApiResponse(
  data: any,
  options: { status?: number } = {}
) {
  const { status = 200 } = options;

  const response = NextResponse.json(data, { status });

  // Add comprehensive cache-busting headers
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, pre-check=0, post-check=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("Vary", "Accept-Encoding, Authorization");
  response.headers.set("Last-Modified", new Date().toUTCString());
  response.headers.set("ETag", `"${Date.now()}"`);

  return response;
}

/**
 * Creates an error response with cache-busting headers
 */
export function createApiErrorResponse(
  error: string,
  status: number = 500,
  details?: any
) {
  const errorData = details ? { error, details } : { error };
  return createApiResponse(errorData, { status });
}

/**
 * Creates a success response with cache-busting headers
 */
export function createApiSuccessResponse(data: any, status: number = 200) {
  return createApiResponse(data, { status });
}

/**
 * Middleware wrapper for API route handlers to automatically add cache-busting headers
 */
export function withCacheBusting<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const response = await handler(...args);

    // Add cache-busting headers if they're not already present
    if (!response.headers.has("Cache-Control")) {
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      response.headers.set("Surrogate-Control", "no-store");
      response.headers.set("Vary", "Accept-Encoding, Authorization");
    }

    return response;
  };
}
