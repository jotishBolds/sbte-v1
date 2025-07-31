import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit } from "@/lib/input-validation";
import { JWT } from "next-auth/jwt"; // make sure this is at the top

interface AuthToken {
  role?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

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
  // noCache: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  noCache:
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, pre-check=0, post-check=0",

  // Short cache for API responses
  shortCache: "public, max-age=300, s-maxage=300",
  // Long cache for static assets
  longCache: "public, max-age=31536000, immutable",
};

// Protected routes that require authentication
// const protectedRoutes = [
//   "/dashboard",
//   "/profile",
//   "/csa-dashboard",
//   "/college-stats",
//   "/api/profile",
//   "/api/dashboard",
//   "/api/students",
//   "/api/departments",
//   "/api/college-admin",
//   "/api/education-dept",
//   "/api/super-admin",
//   "/api/infrastructures",
//   "/view-infrastructure",
//   "/user-creation",
// ];

{
  /*{
 EDUCATION_DEPARTMENT
  SBTE_ADMIN
  COLLEGE_SUPER_ADMIN
  ADM
  HOD
  TEACHER
  FINANCE_MANAGER
  STUDENT
  ALUMNUS
  */
}
// // Public routes (accessible without login)
// const publicRoutes = [
//   "/",
//   "/login",
//   "/register",
//   "/forgot-password",
//   "/contact",
//   "/about-us",
//   "/organization-chart",
//   "/who-is-who",
//   "/affiliated-collages",
//   "/convocations",
//   "/notification-circulation",
//   "/gallery",
//   "/register-alumni",
// ];

// // Role-based protected routes
// const protectedRoutes: { [route: string]: string[] } = {
//   "/dashboard": [
//     "EDUCATION_DEPARTMENT",
//     "SBTE_ADMIN",
//     "COLLEGE_SUPER_ADMIN",
//     "ADM",
//     "HOD",
//     "TEACHER",
//     "FINANCE_MANAGER",
//     "STUDENT",
//     "ALUMNUS",
//   ],
//   "/profile": ["ALL"],
//   "/csa-dashboard": ["ALL"],
//   "/college-stats": ["SBTE_ADMIN", "EDUCATION_DEPARTMENT"],
//   "/user-creation": ["SBTE_ADMIN"],
//   "/view-infrastructure": ["ALL"],
//   "/api/dashboard": ["ALL"],
//   "/api/profile": ["ALL"],
//   "/api/students": ["ALL"],
//   "/api/departments": ["ALL"],
//   "/api/college-admin": ["ALL"],
//   "/api/education-dept": ["EDUCATION_DEPARTMENT"],
//   "/api/super-admin": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],
//   "/api/infrastructures": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],
//   // "/api/loginOtp/sendOtp": ["ALL"],
// };

// // Public API routes that should have restricted HTTP methods
// const publicApiRoutes = [
//   "/api/auth",
//   "/api/register-users",
//   "/api/password-reset",
//   "/api/contact",
//   "/api/loginOtp/sendOtp",
//   // "/api/auth/captcha",
// ];

// Public frontend routes
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/contact",
  "/about-us",
  "/organization-chart",
  "/who-is-who",
  "/affiliated-collages",
  "/convocations",
  "/notification-circulation",
  "/gallery",
  "/register-alumni",
  "/support",
  "/sentry-example-page",
  "/auth-debug",
  "/subjects-",
  "/fee",
  "/privacy",
  "/terms",
  "/Organization-Chart",

  // Pages under (pages) group
  "/pages/about-us",
  "/pages/contact",
  "/pages/affiliated-collages",
  "/pages/convocations",
  "/pages/gallery",
  "/pages/notification-circulation",
  "/pages/organization-chart",
  "/pages/report-generate",
  "/pages/who-is-who",
];

// Role-based protected frontend routes (exhaustive, including dynamic)
const protectedRoutes: { [key: string]: string[] } = {
  "/api/statistics": [
    "EDUCATION_DEPARTMENT",
    "SBTE_ADMIN",
    "COLLEGE_SUPER_ADMIN",
    "FINANCE_MANAGER",
    "HOD",
    "TEACHER",
    "ADM",
  ],
  "/sbte-logo-gov.png": ["All"],
  "/college-stats": ["EDUCATION_DEPARTMENT", "SBTE_ADMIN"],
  "/api/colleges": [
    "EDUCATION_DEPARTMENT",
    "SBTE_ADMIN",
    "FINANCE_MANAGER",
    "ADM",
    "HOD",
    "TEACHER",

    "COLLEGE_SUPER_ADMIN",
  ],
  "/api/educationDepartment/college": ["EDUCATION_DEPARTMENT", "SBTE_ADMIN"],
  "/api/educationDepartment/student": ["EDUCATION_DEPARTMENT", "SBTE_ADMIN"],
  "/api/notification": ["ALL"],
  "/403": ["ALL"],
  "/api/gradeCard/grade-card": ["EDUCATION_DEPARTMENT", "SBTE_ADMIN"],
  "/colleges": ["EDUCATION_DEPARTMENT", "SBTE_ADMIN"],
  "/collage-creation": ["SBTE_ADMIN"],
  "/api/educationDepartment/department": ["SBTE_ADMIN", "EDUCATION_DEPARTMENT"],
  "/api/teacherDesignation": [
    "SBTE_ADMIN",
    "EDUCATION_DEPARTMENT",
    "COLLEGE_SUPER_ADMIN",
  ],
  "/api/employeeCategory": [
    "SBTE_ADMIN",
    "EDUCATION_DEPARTMENT",
    "COLLEGE_SUPER_ADMIN",
  ],
  "/uploads/logos/CCCT-1734886672064.png": ["COLLEGE_SUPER_ADMIN"],
  "/api/fetchHodCreationDepartment": ["COLLEGE_SUPER_ADMIN"],
  // Super Admin
  "/department-creation": ["SBTE_ADMIN"],
  "/departments": ["SBTE_ADMIN", "COLLEGE_SUPER_ADMIN"],
  "/departments/[id]": ["SBTE_ADMIN", "COLLEGE_SUPER_ADMIN"],
  "/notification": ["SBTE_ADMIN"],
  "/notification/list": ["SBTE_ADMIN"],
  "/user-creation": ["SBTE_ADMIN"],
  "/api/SBTEUserManagement": ["SBTE_ADMIN"],
  "/view-eligibility": ["SBTE_ADMIN"],
  "/api/eligibilityList": ["SBTE_ADMIN"],
  "/view-infrastructure": ["SBTE_ADMIN"],
  "/view-schedules": ["SBTE_ADMIN"],
  "/api/schedules": ["SBTE_ADMIN"],
  "/notification/load-balance": ["SBTE_ADMIN"],
  "/api/loadBalancing": ["SBTE_ADMIN"],
  "/api/college-csa/college/": ["COLLEGE_SUPER_ADMIN"],
  "/api/monthlyBatchSubjectClasses": ["COLLEGE_SUPER_ADMIN"],
  "/templates/exam_attendance_template.xlsx": ["COLLEGE_SUPER_ADMIN"],
  "/batch/subjects": ["COLLEGE_SUPER_ADMIN"],
  "/api/subjects": ["COLLEGE_SUPER_ADMIN"],
  "/api/subjectType": ["COLLEGE_SUPER_ADMIN"],
  "/api/batchSubjectAttendance/monthlyBatchSubjectAttendance/excelImport": [
    "COLLEGE_SUPER_ADMIN",
  ],
  "/api/teachers": ["COLLEGE_SUPER_ADMIN"],
  "/api/teacherSubjectAssign": ["COLLEGE_SUPER_ADMIN"],
  "/api/student": ["COLLEGE_SUPER_ADMIN"],
  "/import-students": ["COLLEGE_SUPER_ADMIN"],

  "/certificate": ["COLLEGE_SUPER_ADMIN"],
  "/api/certificateIssuance/singleStudent": ["COLLEGE_SUPER_ADMIN"],
  "/api/certificateType": ["COLLEGE_SUPER_ADMIN"],

  // "/download-schedules": ["SBTE_ADMIN"],F
  // College Admin (exhaustive, including all nested and dynamic)
  "/academic-year": ["COLLEGE_SUPER_ADMIN"],
  "/api/academicYear": ["COLLEGE_SUPER_ADMIN"],
  "/admission-year": ["COLLEGE_SUPER_ADMIN"],
  "/batch": ["COLLEGE_SUPER_ADMIN"],
  "/api/batch": ["COLLEGE_SUPER_ADMIN"],
  "/batch-type": ["COLLEGE_SUPER_ADMIN"],
  "/batch-year": ["COLLEGE_SUPER_ADMIN"],
  "/api/batchYear": ["COLLEGE_SUPER_ADMIN"],
  "/create-user": ["COLLEGE_SUPER_ADMIN"],
  "/create-user/users-list": ["COLLEGE_SUPER_ADMIN"],
  // "/csa-dashboard": ["COLLEGE_SUPER_ADMIN"],
  "/eligibility-upload": ["COLLEGE_SUPER_ADMIN"],
  "/exam-marks": ["COLLEGE_SUPER_ADMIN"],
  "/exam-marks/import": ["COLLEGE_SUPER_ADMIN"],
  "/exam-type": ["COLLEGE_SUPER_ADMIN"],
  "/infrastructures": ["COLLEGE_SUPER_ADMIN"],
  "/message": ["COLLEGE_SUPER_ADMIN"],
  // "/profile": ["COLLEGE_SUPER_ADMIN"],
  "/programs": ["COLLEGE_SUPER_ADMIN"],
  "/api/programs": ["COLLEGE_SUPER_ADMIN"],
  "/programs/create": ["COLLEGE_SUPER_ADMIN"],
  "/programs/programs-list": ["COLLEGE_SUPER_ADMIN"],
  "/schedules-upload": ["COLLEGE_SUPER_ADMIN"],
  "/semester": ["COLLEGE_SUPER_ADMIN"],
  "/api/semester": ["COLLEGE_SUPER_ADMIN"],
  // All nested and dynamic routes under (college-admin)
  "(gradecard)/post-grade-details": ["COLLEGE_SUPER_ADMIN"],
  "(gradecard)/post-external-marks": ["COLLEGE_SUPER_ADMIN"],
  "(gradecard)/gradecard-view": ["COLLEGE_SUPER_ADMIN"],
  "(gradecard)/gradecard-view/[id]": ["COLLEGE_SUPER_ADMIN"],
  "(gradecard)/import-internal": ["COLLEGE_SUPER_ADMIN"],
  "(students)/import-students": ["COLLEGE_SUPER_ADMIN"],
  "(students)/student-register": ["COLLEGE_SUPER_ADMIN"],
  "(students)/student-list": ["COLLEGE_SUPER_ADMIN"],
  "(students)/feedbacks-list": ["COLLEGE_SUPER_ADMIN"],
  "(students)/batchwise-marks-list": ["COLLEGE_SUPER_ADMIN"],
  "(students)/batchwise-attendance": ["COLLEGE_SUPER_ADMIN"],
  "(hod)/subjects": ["COLLEGE_SUPER_ADMIN"],
  "(hod)/batchwisesubattendance": ["COLLEGE_SUPER_ADMIN"],
  "(hod)/batchwisesubmarks": ["COLLEGE_SUPER_ADMIN"],
  "(hod)/load-balance": ["COLLEGE_SUPER_ADMIN"],
  "batch/student-batch-assign": ["COLLEGE_SUPER_ADMIN"],
  "batch/subjects": ["COLLEGE_SUPER_ADMIN"],
  "batch/teacher-assign": ["COLLEGE_SUPER_ADMIN"],
  "batch/monthly-batchsubject-classes": ["COLLEGE_SUPER_ADMIN"],
  "batch/monthly-batchsubject-attendance": ["COLLEGE_SUPER_ADMIN"],
  "batch/monthly-batchsubject-attendance/import": ["COLLEGE_SUPER_ADMIN"],
  "(student-subjects)/subject-type": ["COLLEGE_SUPER_ADMIN"],
  "(student-subjects)/student-subjects": ["COLLEGE_SUPER_ADMIN"],
  "(finance)/batch-base-exam-fees": ["COLLEGE_SUPER_ADMIN"],
  "(finance)/student-batch-exam-fee": ["COLLEGE_SUPER_ADMIN"],
  "(teacher)/teacher-designation": ["COLLEGE_SUPER_ADMIN"],
  "(alumni)/register-alumni": ["COLLEGE_SUPER_ADMIN"],
  "(alumni)/alumni-list": ["COLLEGE_SUPER_ADMIN"],
  "(certificates)/certificate": ["COLLEGE_SUPER_ADMIN"],
  "(certificates)/certificate-types": ["COLLEGE_SUPER_ADMIN"],
  "(emp)/employee-category": ["COLLEGE_SUPER_ADMIN"],
  // Education Dept
  "/education-dept/college-stats": ["EDUCATION_DEPARTMENT"],
  "/education-dept/college-stats/[id]": ["EDUCATION_DEPARTMENT"],
  "/education-dept/college-stats/departments-stats": ["EDUCATION_DEPARTMENT"],
  "/education-dept/college-stats/departments-stats/[id]": [
    "EDUCATION_DEPARTMENT",
  ],
  "/education-dept/grade-card": ["EDUCATION_DEPARTMENT"],
  // Students
  "/students/exam-fee": ["STUDENT"],
  "/students/my-certificates": ["STUDENT"],
  "/students/my-feedback": ["STUDENT"],
  "/students/student-attendance": ["STUDENT"],
  "/students/student-batch-marks": ["STUDENT"],
  // Dashboard, Profile, etc.
  "/dashboard": [
    "EDUCATION_DEPARTMENT",
    "SBTE_ADMIN",
    "COLLEGE_SUPER_ADMIN",
    "ADM",
    "HOD",
    "TEACHER",
    "FINANCE_MANAGER",
    "STUDENT",
    "ALUMNUS",
  ],
  "/profile": ["ALL"],
  "/csa-dashboard": ["ALL"],
  // "/user-creation": ["SBTE_ADMIN"],

  "/api/dashboard": ["ALL"],
  "/api/profile": ["ALL"],
  "/api/students": ["ALL"],
  "/api/departments": ["ALL"],
  "/api/college-admin": ["ALL"],
  // "/api/education-dept": ["EDUCATION_DEPARTMENT"],
  "/api/super-admin": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],
  "/api/infrastructures": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],
};

// API routes (protected, exhaustive, including dynamic)
// const protectedApiRoutes = {
//   "/api/dashboard": ["ALL"],
//   "/api/profile": ["ALL"],
//   "/api/students": ["ALL"],
//   "/api/departments": ["ALL"],
//   "/api/college-admin": ["ALL"],
//   "/api/education-dept": ["EDUCATION_DEPARTMENT"],
//   "/api/super-admin": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],
//   "/api/infrastructures": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],

// };

// Public API routes (exhaustive)
const publicApiRoutes = [
  "/api/auth",
  "/api/departments/alumni",
  "/api/register-users",
  "/api/password-reset",
  "/api/contact",
  "/api/loginOtp/sendOtp",
  "/api/auth/captcha",
  "/api/auth/session-cleanup",
  "/api/auth/check-lock-status",
  "/api/auth/verify-captcha",
  "/api/batchYear/alumni/",
  "/api/admissionYear/alumni/",
  "/api/programs/alumni/",
  "/api/alumni/upload-profile-pic",
  "/api/register-alumni",
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
      // const token = await getToken({
      //   req: request,
      //   secret: process.env.NEXTAUTH_SECRET,
      //   cookieName:
      //     process.env.NODE_ENV === "production"
      //       ? "__Secure-next-auth.session-token"
      //       : "next-auth.session-token",
      // });
      const token = (await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName:
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token",
      })) as JWT & {
        role?: string;
        id?: string;
        username?: string;
        collegeId?: string;
        departmentId?: string;
      };

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

    console.log(
      "Allowing access to login page after applying security measures"
    );
    // Apply security headers manually for the login response
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    // response.headers.set("Server", "SBTE-Server");
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
  // response.headers.set("Server", "SBTE-Server");

  // Apply appropriate cache control headers
  if (pathname.startsWith("/api/")) {
    // API routes - no cache for sensitive data
    // if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    //   response.headers.set("Cache-Control", cacheHeaders.noCache);
    //   response.headers.set("Pragma", "no-cache");
    //   response.headers.set("Expires", "0");
    // }
    if (
      Object.keys(protectedRoutes).some((route) => pathname.startsWith(route))
    ) {
      response.headers.set("Cache-Control", cacheHeaders.noCache);
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
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
  }

  // // We need to implement the following if it is confirmed about adding the remaining all routes into protectedRoutes
  // // HTTP method restrictions for public API routes
  // const isPublicRoute = publicApiRoutes.some((route) =>
  //   pathname.startsWith(route)
  // );

  // if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
  //   if (isPublicRoute && !allowedPublicMethods.includes(method)) {
  //     return new NextResponse("Method Not Allowed", {
  //       status: 405,
  //       headers: {
  //         Allow: allowedPublicMethods.join(", "),
  //         ...Object.fromEntries(
  //           Object.entries(securityHeaders).map(([key, value]) => [key, value])
  //         ),
  //       },
  //     });
  //   }
  // }

  // // Global blocked method restriction except for protected routes or allowed public routes
  // const blockedMethods = ["PUT", "DELETE", "PATCH", "TRACE", "CONNECT"];
  // const isProtectedRoute = protectedRoutes.some((route) =>
  //   pathname.startsWith(route)
  // );

  // if (
  //   blockedMethods.includes(method) &&
  //   !isProtectedRoute &&
  //   !(isPublicRoute && allowedPublicMethods.includes(method)) // ✅ this prevents conflict
  // ) {
  //   return new NextResponse("Method Not Allowed", {
  //     status: 405,
  //     headers: {
  //       Allow: "GET, POST, OPTIONS",
  //       ...Object.fromEntries(
  //         Object.entries(securityHeaders).map(([key, value]) => [key, value])
  //       ),
  //     },
  //   });
  // }

  // Authentication check for protected routes
  // Normalize pathname to avoid trailing slash issues
  const normalizePath = (path: string) =>
    path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  const normalizedPath = normalizePath(pathname);

  // Skip public routes
  if (
    !publicRoutes.includes(normalizedPath) &&
    // !publicApiRoutes.includes(normalizedPath)
    !publicApiRoutes.some((route) => normalizedPath.startsWith(route))
  ) {
    const token = (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    })) as JWT & {
      role?: string;
      id?: string;
      username?: string;
      collegeId?: string;
      departmentId?: string;
    };

    if (!token || !token.role) {
      console.log("Unauthenticated access attempt to:", normalizedPath);
      if (pathname.startsWith("/api/")) {
        return new NextResponse("Unauthorized", { status: 401 });
      } else {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Step 1: Match the route key using startsWith
    const matchedRoute = Object.keys(protectedRoutes).find((routeKey) =>
      normalizedPath.startsWith(routeKey)
    );

    // Step 2: Use the matched route to get allowed roles
    const allowedRoles = matchedRoute
      ? protectedRoutes[matchedRoute]
      : undefined;

    // Check role-based access if defined
    // const allowedRoles = protectedRoutes[normalizedPath];

    if (
      // allowedRoles && // if the route is protected
      // allowedRoles.length > 0 &&
      // !(
      //   (
      //     allowedRoles.includes("ALL") || // 👈 allow all users
      //     allowedRoles.includes(token.role || "")
      //   ) // 👈 match specific role
      // )

      !allowedRoles || // 👈 if route is not defined
      (allowedRoles.length > 0 &&
        !(
          allowedRoles.includes("ALL") ||
          allowedRoles.includes(token.role || "")
        ))
    ) {
      console.warn(`Access denied to ${normalizedPath} for role ${token.role}`);
      if (pathname.startsWith("/api/")) {
        return new NextResponse("Forbidden", { status: 403 });
      } else {
        console.log("Redirecting to 403 page for:", normalizedPath);
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }

    // Optional: Add session validation header
    response.headers.set("X-User-Session", "validated");
  }

  // if (protectedRoutes.some((route) => pathname.startsWith(route))) {
  //   try {
  //     const token = await getToken({
  //       req: request,
  //       secret: process.env.NEXTAUTH_SECRET,
  //       cookieName:
  //         process.env.NODE_ENV === "production"
  //           ? "__Secure-next-auth.session-token"
  //           : "next-auth.session-token",
  //     });

  //     console.log("Auth check for", pathname, "- Token exists:", !!token);

  //     if (!token || !token.id) {
  //       // Only redirect if not already on login page to prevent loops
  //       if (!pathname.startsWith("/api/")) {
  //         console.log("Redirecting to login from:", pathname);
  //         const loginUrl = new URL("/login", request.url);
  //         loginUrl.searchParams.set("callbackUrl", pathname);
  //         return NextResponse.redirect(loginUrl);
  //       }

  //       // Return 401 for API routes
  //       if (pathname.startsWith("/api/")) {
  //         return new NextResponse("Unauthorized", {
  //           status: 401,
  //           headers: {
  //             ...Object.fromEntries(
  //               Object.entries(securityHeaders).map(([key, value]) => [
  //                 key,
  //                 value,
  //               ])
  //             ),
  //           },
  //         });
  //       }
  //     } else {
  //       // Set session validation header
  //       response.headers.set("X-User-Session", "validated");
  //     }
  //   } catch (error) {
  //     console.error("Token validation error:", error);
  //     // On error, allow through to avoid breaking the app
  //   }
  // }

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
