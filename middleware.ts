import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit } from "@/lib/input-validation";

// Security headers configuration
const securityHeaders = {
  // Prevent clickjacking attacks
  "X-Frame-Options": "DENY",
  // Block content type sniffing
  "X-Content-Type-Options": "nosniff",
  // Enable XSS protection
  "X-XSS-Protection": "1; mode=block",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Content Security Policy - adjust as needed for your app
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://newassets.hcaptcha.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.hcaptcha.com https://api.razorpay.com; frame-src https://js.hcaptcha.com https://newassets.hcaptcha.com https://api.razorpay.com;",
  // Permissions policy (formerly Feature Policy)
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

// Cache control headers for different route types
const cacheHeaders = {
  // No cache for sensitive/dynamic content
  noCache: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  // Short cache for API responses
  shortCache: "public, max-age=300, s-maxage=300",
  // Long cache for static assets
  longCache: "public, max-age=31536000, immutable",
};

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/csa-dashboard",
  "/college-stats",
  "/api/profile",
  "/api/dashboard",
  "/api/students",
  "/api/college-admin",
  "/api/education-dept",
  "/api/super-admin",
];

// Public API routes that should have restricted HTTP methods
const publicApiRoutes = [
  "/api/auth",
  "/api/register-users",
  "/api/password-reset",
  "/api/contact",
];

// Allowed HTTP methods for public routes
const allowedPublicMethods = ["GET", "POST", "OPTIONS"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  const method = request.method;
  const clientIp =
    request.ip || request.headers.get("x-forwarded-for") || "unknown";
  // Skip middleware for NextAuth routes and login page with callback
  if (pathname.startsWith("/api/auth")) {
    console.log("Skipping middleware for NextAuth route:", pathname);
    return response;
  }
  // Skip auth check for login page to prevent redirect loops, but check if user is already authenticated
  if (pathname === "/login") {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token",
      });

      // If user is already authenticated and accessing login page, redirect to callback or dashboard
      if (token && token.id) {
        const callbackUrl =
          request.nextUrl.searchParams.get("callbackUrl") || "/dashboard";
        console.log(
          "Authenticated user accessing login, redirecting to:",
          callbackUrl
        );
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }
    } catch (error) {
      console.error("Error checking authentication for login page:", error);
    }

    console.log("Allowing access to login page");
    return response;
  }

  // Rate limiting check
  const rateLimitKey = `${clientIp}:${pathname}`;
  const rateLimit = checkRateLimit(rateLimitKey, 100, 60000); // 100 requests per minute

  if (!rateLimit.allowed) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(
          Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        ),
        ...Object.fromEntries(
          Object.entries(securityHeaders).map(([key, value]) => [key, value])
        ),
      },
    });
  }

  // Input validation for query parameters and form data
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Check for suspicious query parameters
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /select\s+.*\s+from/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+.*\s+set/i,
  ];

  for (const [key, value] of searchParams.entries()) {
    // Check parameter length
    if (key.length > 100 || value.length > 1000) {
      return new NextResponse("Invalid Request Parameters", {
        status: 400,
        headers: {
          ...Object.fromEntries(
            Object.entries(securityHeaders).map(([key, value]) => [key, value])
          ),
        },
      });
    }

    // Check for suspicious patterns
    const combinedParam = `${key}=${value}`;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(combinedParam)) {
        return new NextResponse("Invalid Request Parameters", {
          status: 400,
          headers: {
            ...Object.fromEntries(
              Object.entries(securityHeaders).map(([key, value]) => [
                key,
                value,
              ])
            ),
          },
        });
      }
    }
  }

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  // Remove or obscure server identification headers
  response.headers.delete("Server");
  response.headers.delete("X-Powered-By");
  // Remove duplicate headers if they exist
  const headersToCheck = ["Cache-Control", "Content-Type", "Set-Cookie"];
  headersToCheck.forEach((header) => {
    if (header === "Set-Cookie") {
      const values = response.headers.getSetCookie?.() || [];
      if (values.length > 1) {
        // Keep only the last Set-Cookie header to avoid duplicates
        response.headers.delete("Set-Cookie");
        if (values.length > 0) {
          response.headers.set("Set-Cookie", values[values.length - 1]);
        }
      }
    } else {
      // For other headers, check if they have multiple values
      const currentValue = response.headers.get(header);
      if (currentValue && currentValue.includes(",")) {
        // If multiple values exist (comma-separated), keep only the first one
        const firstValue = currentValue.split(",")[0].trim();
        response.headers.set(header, firstValue);
      }
    }
  });

  // Set custom server header to obscure the actual server
  response.headers.set("Server", "SBTE-Server");

  // Apply appropriate cache control headers
  if (pathname.startsWith("/api/")) {
    // API routes - no cache for sensitive data
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      response.headers.set("Cache-Control", cacheHeaders.noCache);
    } else {
      response.headers.set("Cache-Control", cacheHeaders.shortCache);
    }
  } else if (pathname.startsWith("/_next/static/")) {
    // Next.js static assets - long cache
    response.headers.set("Cache-Control", cacheHeaders.longCache);
  } else if (
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
  ) {
    // Other static assets - long cache
    response.headers.set("Cache-Control", cacheHeaders.longCache);
  } else {
    // HTML pages - no cache for dynamic content
    response.headers.set("Cache-Control", cacheHeaders.noCache);
  }

  // HTTP method restrictions for public API routes
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const isPublicRoute = publicApiRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isPublicRoute && !allowedPublicMethods.includes(method)) {
      return new NextResponse("Method Not Allowed", {
        status: 405,
        headers: {
          Allow: allowedPublicMethods.join(", "),
          ...Object.fromEntries(
            Object.entries(securityHeaders).map(([key, value]) => [key, value])
          ),
        },
      });
    }
  } // Authentication check for protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token",
      });

      console.log("Auth check for", pathname, "- Token exists:", !!token);

      if (!token || !token.id) {
        // Only redirect if not already on login page to prevent loops
        if (!pathname.startsWith("/api/")) {
          console.log("Redirecting to login from:", pathname);
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("callbackUrl", pathname);
          return NextResponse.redirect(loginUrl);
        }

        // Return 401 for API routes
        if (pathname.startsWith("/api/")) {
          return new NextResponse("Unauthorized", {
            status: 401,
            headers: {
              ...Object.fromEntries(
                Object.entries(securityHeaders).map(([key, value]) => [
                  key,
                  value,
                ])
              ),
            },
          });
        }
      } else {
        // Set session validation header
        response.headers.set("X-User-Session", "validated");
      }
    } catch (error) {
      console.error("Token validation error:", error);
      // On error, allow through to avoid breaking the app
    }
  }

  // Add security headers for file uploads
  if (pathname.startsWith("/api/upload") || pathname.includes("upload")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Content-Security-Policy", "default-src 'none'");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
