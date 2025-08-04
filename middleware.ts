import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit } from "@/lib/input-validation";
import { JWT } from "next-auth/jwt"; // make sure this is at the top

// Enhanced route matching with improved security
// Dynamic route patterns supported for better protection

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
  // Static asset folders under /public
  "/Convocation1/",
  "/Convocation2/",
  "/Convocation3/",
  "/home/",
  "/notification-pdf/",
  "/students-images/",
  "/templates/",
  "/uploads/",
];

// Role-based protected frontend routes (exhaustive, including dynamic)
const protectedRoutes: { [key: string]: string[] } = {
  "/api/statistics": [
    "EDUCATION_DEPARTMENT",
    "SBTE_ADMIN",
    "COLLEGE_SUPER_ADMIN",
    "TEACHER",
    "HOD",
    "FINANCE_MANAGER",
    "STUDENT",
    "ALUMNUS",
  ],
  "/college-stats": ["EDUCATION_DEPARTMENT", "SBTE_ADMIN"],
  "/college-stats/departments-stats": ["EDUCATION_DEPARTMENT"],
  "/api/colleges": [
    "EDUCATION_DEPARTMENT",
    "SBTE_ADMIN",
    "COLLEGE_SUPER_ADMIN",
    "TEACHER",
  ],
  "/api/educationDepartment/college": ["EDUCATION_DEPARTMENT", "SBTE_ADMIN"],
  "/api/educationDepartment/student": ["EDUCATION_DEPARTMENT", "SBTE_ADMIN"],
  "/api/notification": ["ALL"],
  "/403": ["ALL"],

  // SBTE Admin specific routes (direct access)
  "/colleges": ["SBTE_ADMIN"],
  "/departments": ["SBTE_ADMIN", "COLLEGE_SUPER_ADMIN"], // Includes dynamic route [collegeId]
  "/view-infrastructure": ["SBTE_ADMIN"],
  "/view-eligibility": ["SBTE_ADMIN"],
  "/view-schedules": ["SBTE_ADMIN"],
  "/user-creation": ["SBTE_ADMIN"],
  "/notification/load-balance": ["SBTE_ADMIN"],
  "/notification": ["SBTE_ADMIN"],

  // College Admin (exhaustive, including all nested and dynamic)
  "/csa-dashboard": ["COLLEGE_SUPER_ADMIN"],
  "/batch": ["COLLEGE_SUPER_ADMIN"],
  "/batch-year": ["COLLEGE_SUPER_ADMIN"],
  "/batch/monthly-batchsubject-classes": ["COLLEGE_SUPER_ADMIN", "TEACHER"],
  "/batch/monthly-batchsubject-attendance": ["COLLEGE_SUPER_ADMIN", "TEACHER"],
  "/batch/monthly-batchsubject-attendance/import": [
    "COLLEGE_SUPER_ADMIN",
    "TEACHER",
  ],
  "/batch/subjects": ["COLLEGE_SUPER_ADMIN", "TEACHER"],
  "/batch/teacher-assign": ["COLLEGE_SUPER_ADMIN", "HOD"],
  "/batch/student-batch-assign": ["COLLEGE_SUPER_ADMIN"],
  "/import-students": ["COLLEGE_SUPER_ADMIN"],
  "/batchwise-marks-list": ["COLLEGE_SUPER_ADMIN"],
  "/batchwise-attendance": ["COLLEGE_SUPER_ADMIN"],
  "/create-user/users-list": ["COLLEGE_SUPER_ADMIN", "ADM"],
  "/certificate": ["COLLEGE_SUPER_ADMIN"],
  "/certificate-types": ["COLLEGE_SUPER_ADMIN"],
  "/gradecard": ["COLLEGE_SUPER_ADMIN"],
  "/gradecard-view": ["COLLEGE_SUPER_ADMIN"],
  "/import-internal": ["COLLEGE_SUPER_ADMIN"],
  "/post-external-marks": ["COLLEGE_SUPER_ADMIN"],
  "/post-grade-details": ["COLLEGE_SUPER_ADMIN"],
  "/teacher": ["COLLEGE_SUPER_ADMIN"],
  "/teacher-designation": ["COLLEGE_SUPER_ADMIN"],
  "/student": ["COLLEGE_SUPER_ADMIN"],
  "/student-register": ["COLLEGE_SUPER_ADMIN"],
  "/student-list": ["COLLEGE_SUPER_ADMIN"],
  "/student-subjects": ["COLLEGE_SUPER_ADMIN"],
  "/exams": ["COLLEGE_SUPER_ADMIN"],
  "/exam-type": ["COLLEGE_SUPER_ADMIN"],
  "/exam-marks": ["COLLEGE_SUPER_ADMIN", "TEACHER"],
  "/exam-marks/import": ["COLLEGE_SUPER_ADMIN", "TEACHER"],
  "/alumni-list": ["COLLEGE_SUPER_ADMIN"],
  "/feedbacks-list": ["COLLEGE_SUPER_ADMIN"],
  "/semester": ["COLLEGE_SUPER_ADMIN"],
  "/programs": ["COLLEGE_SUPER_ADMIN"],
  "/programs/create": ["COLLEGE_SUPER_ADMIN"],
  "/academic-year": ["COLLEGE_SUPER_ADMIN"],
  "/admission-year": ["COLLEGE_SUPER_ADMIN"],
  "/infrastructures": ["COLLEGE_SUPER_ADMIN", "ADM"],
  "/schedules-upload": ["COLLEGE_SUPER_ADMIN", "TEACHER"],
  "/eligibility-upload": ["COLLEGE_SUPER_ADMIN", "TEACHER"],
  "/message": ["COLLEGE_SUPER_ADMIN"],

  // HOD specific routes
  "/batchwisesubmarks": ["HOD"],
  "/batchwisesubattendance": ["HOD"],
  "/load-balance": ["HOD"],

  // Finance Manager routes
  "/batch-base-exam-fees": ["FINANCE_MANAGER"],
  "/student-batch-exam-fee": ["FINANCE_MANAGER"],

  // Student routes
  "/my-certificates": ["STUDENT"],
  "/my-feedback": ["STUDENT"],
  "/exam-fee": ["STUDENT"],
  "/student-attendance": ["STUDENT"],
  "/student-batch-marks": ["STUDENT"],

  // Super Admin prefixed routes (legacy)
  "/super-admin/collage-creation": ["SBTE_ADMIN"],
  "/super-admin/colleges": ["SBTE_ADMIN"],
  "/super-admin/department-creation": ["SBTE_ADMIN"],
  "/super-admin/departments": ["SBTE_ADMIN"],
  "/super-admin/departments/[id]": ["SBTE_ADMIN"],
  "/super-admin/notification": ["SBTE_ADMIN"],
  "/super-admin/notification/list": ["SBTE_ADMIN"],
  "/super-admin/notification/load-balance": ["SBTE_ADMIN"],
  "/super-admin/user-creation": ["SBTE_ADMIN"],
  "/super-admin/view-eligibility": ["SBTE_ADMIN"],
  "/super-admin/view-infrastructure": ["SBTE_ADMIN"],
  "/super-admin/view-schedules": ["SBTE_ADMIN"],

  // Legacy College Admin prefixed routes (for backward compatibility)
  "/college-admin/academic-year": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/admission-year": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/batch": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/batch-type": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/batch-year": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/create-user": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/create-user/users-list": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/csa-dashboard": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/eligibility-upload": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/exam-marks": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/exam-marks/import": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/exam-type": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/infrastructures": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/message": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/profile": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/programs": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/programs/create": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/programs/programs-list": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/schedules-upload": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/semester": ["COLLEGE_SUPER_ADMIN"],
  // All nested and dynamic routes under (college-admin)
  "/college-admin/(gradecard)/post-grade-details": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(gradecard)/post-external-marks": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(gradecard)/gradecard-view": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(gradecard)/gradecard-view/[id]": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(gradecard)/import-internal": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(students)/import-students": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(students)/student-register": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(students)/student-list": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(students)/feedbacks-list": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(students)/batchwise-marks-list": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(students)/batchwise-attendance": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(hod)/subjects": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(hod)/batchwisesubattendance": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(hod)/batchwisesubmarks": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(hod)/load-balance": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/batch/student-batch-assign": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/batch/subjects": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/batch/teacher-assign": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/batch/monthly-batchsubject-classes": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/batch/monthly-batchsubject-attendance": [
    "COLLEGE_SUPER_ADMIN",
  ],
  "/college-admin/batch/monthly-batchsubject-attendance/import": [
    "COLLEGE_SUPER_ADMIN",
  ],
  "/college-admin/(student-subjects)/subject-type": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(student-subjects)/student-subjects": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(finance)/batch-base-exam-fees": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(finance)/student-batch-exam-fee": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(teacher)/teacher-designation": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(alumni)/register-alumni": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(alumni)/alumni-list": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(certificates)/certificate": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(certificates)/certificate-types": ["COLLEGE_SUPER_ADMIN"],
  "/college-admin/(emp)/employee-category": ["COLLEGE_SUPER_ADMIN"],
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

  // API routes
  "/api/dashboard": ["ALL"],
  "/api/profile": ["ALL"],
  "/api/students": ["ALL"],
  "/api/departments": ["ALL"],
  "/api/college-admin": ["ALL"],
  "/api/super-admin": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],
  "/api/infrastructures": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],
  "/api/batch": ["COLLEGE_SUPER_ADMIN", "TEACHER", "HOD"],
  "/api/exam-marks": ["COLLEGE_SUPER_ADMIN", "TEACHER"],
  "/api/attendance": ["COLLEGE_SUPER_ADMIN", "TEACHER", "STUDENT"],
  "/api/certificates": ["COLLEGE_SUPER_ADMIN", "STUDENT"],
  "/api/fees": ["COLLEGE_SUPER_ADMIN", "FINANCE_MANAGER", "STUDENT"],
  "/api/users": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN", "ADM"],
  "/api/programs": ["COLLEGE_SUPER_ADMIN", "SBTE_ADMIN"],
  "/api/academic-year": ["COLLEGE_SUPER_ADMIN"],
  "/api/admission-year": ["COLLEGE_SUPER_ADMIN"],
  "/api/semester": ["COLLEGE_SUPER_ADMIN"],
  "/api/feedback": ["COLLEGE_SUPER_ADMIN", "STUDENT"],
  "/api/alumni": ["COLLEGE_SUPER_ADMIN", "ALUMNUS"],
  "/api/load-balance": ["HOD", "SBTE_ADMIN"],
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
  "/api/sbte-auth/register", // Add SBTE admin registration endpoint
  "/api/setup/default-admin",
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

    // Enhanced session validation for authenticated users
    if (token.id) {
      // For now, we'll skip the database validation in middleware due to edge runtime limitations
      // Database-based session validation will be handled in API routes and components
      console.log(
        "Authenticated user accessing:",
        normalizedPath,
        "User ID:",
        token.id
      );
    }

    // Step 1: Match the route key using startsWith for better matching
    const matchedRoute = Object.keys(protectedRoutes).find((routeKey) => {
      // Exact match first
      if (normalizedPath === routeKey) return true;
      // StartsWith match for nested routes
      if (normalizedPath.startsWith(routeKey + "/")) return true;
      // Dynamic route matching (e.g., /api/notification/[id])
      if (routeKey.includes("[") && routeKey.includes("]")) {
        const dynamicPattern = routeKey
          .replace(/\[([^\]]+)\]/g, "([^/]+)")
          .replace(/\//g, "\\/");
        const regex = new RegExp(`^${dynamicPattern}$`);
        return regex.test(normalizedPath);
      }
      return false;
    });

    // Step 2: Use the matched route to get allowed roles
    const allowedRoles = matchedRoute
      ? protectedRoutes[matchedRoute]
      : undefined;

    // Check role-based access if defined
    // const allowedRoles = protectedRoutes[normalizedPath];

    if (
      allowedRoles && // if the route is protected
      allowedRoles.length > 0 &&
      !(
        (
          allowedRoles.includes("ALL") || // allow all authenticated users
          allowedRoles.includes(token.role || "")
        ) // match specific role
      )
    ) {
      console.warn(`Access denied to ${normalizedPath} for role ${token.role}`);
      console.warn(`Allowed roles for ${normalizedPath}:`, allowedRoles);
      if (pathname.startsWith("/api/")) {
        return new NextResponse("Forbidden", { status: 403 });
      } else {
        return NextResponse.redirect(new URL("/forbidden", request.url));
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
