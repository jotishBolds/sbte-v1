# Remaining Security Fixes Implementation Guide

## 🚨 Critical Fixes Needed

### 1. CORS Configuration

Create `lib/cors-config.ts`:

```typescript
import { NextResponse } from "next/server";

export const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.ALLOWED_ORIGINS || "https://your-domain.com",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

export function addCorsHeaders(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
```

### 2. HTTP Methods Restriction

Update `middleware.ts` to add:

```typescript
// Disable dangerous HTTP methods
const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
if (!allowedMethods.includes(request.method)) {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
```

### 3. Cache Control Headers

Add to middleware.ts:

```typescript
// Add cache control for sensitive routes
if (pathname.startsWith("/api/auth") || pathname.startsWith("/dashboard")) {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
}
```

### 4. Server Header Removal

Add to `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Server",
            value: "Web Server", // Generic server name
          },
          {
            key: "X-Powered-By",
            value: "", // Remove X-Powered-By header
          },
        ],
      },
    ];
  },
  poweredByHeader: false, // Disable X-Powered-By header
};
```

## 🔧 Medium Priority Fixes

### 5. Password History Implementation

Create `lib/password-history.ts`:

```typescript
import prisma from "@/src/lib/prisma";
import { hash, compare } from "bcryptjs";

export async function checkPasswordHistory(
  userId: string,
  newPassword: string
): Promise<boolean> {
  const passwordHistory = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5, // Check last 5 passwords
  });

  for (const oldPassword of passwordHistory) {
    if (await compare(newPassword, oldPassword.hashedPassword)) {
      return false; // Password was used before
    }
  }
  return true; // Password is new
}

export async function addPasswordToHistory(
  userId: string,
  hashedPassword: string
) {
  await prisma.passwordHistory.create({
    data: { userId, hashedPassword },
  });

  // Keep only last 5 passwords
  const count = await prisma.passwordHistory.count({ where: { userId } });
  if (count > 5) {
    const oldestPasswords = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: count - 5,
    });

    await prisma.passwordHistory.deleteMany({
      where: { id: { in: oldestPasswords.map((p) => p.id) } },
    });
  }
}
```

### 6. Enhanced Logging System

Create `lib/security-logger.ts`:

```typescript
import prisma from "@/src/lib/prisma";

export async function logSecurityEvent(event: {
  type: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}) {
  await prisma.securityLog.create({
    data: {
      eventType: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      severity: event.severity,
      timestamp: new Date(),
    },
  });

  // Alert on critical events
  if (event.severity === "CRITICAL") {
    // Send notification to admins
    console.error("CRITICAL SECURITY EVENT:", event);
  }
}
```

## 🛡️ Additional Security Enhancements

### 7. Session Security Improvements

Update `lib/enhanced-session-management.ts`:

```typescript
// Add session fingerprinting
export function generateSessionFingerprint(
  ipAddress: string,
  userAgent: string
): string {
  const crypto = require("crypto");
  return crypto
    .createHash("sha256")
    .update(ipAddress + userAgent + process.env.SESSION_SECRET)
    .digest("hex");
}

// Validate session fingerprint
export function validateSessionFingerprint(
  sessionFingerprint: string,
  currentIp: string,
  currentUserAgent: string
): boolean {
  const expectedFingerprint = generateSessionFingerprint(
    currentIp,
    currentUserAgent
  );
  return sessionFingerprint === expectedFingerprint;
}
```

### 8. Rate Limiting Enhancement

Create `lib/advanced-rate-limiting.ts`:

```typescript
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDuration: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  login: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    blockDuration: 30 * 60 * 1000,
  },
  otp: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    blockDuration: 60 * 60 * 1000,
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 1,
    blockDuration: 60 * 60 * 1000,
  },
};

export function advancedRateLimit(identifier: string, action: string) {
  const config = rateLimitConfigs[action];
  // Implementation for advanced rate limiting with exponential backoff
}
```

## 📋 Environment Variables Needed

Add to `.env.local`:

```env
# Security Configuration
SESSION_SECRET=your-very-long-random-session-secret
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
SECURITY_LOG_LEVEL=INFO

# Email Configuration (Gmail App Password)
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password

# Database Security
DATABASE_ENCRYPTION_KEY=your-database-encryption-key
```

## 🔒 Production Deployment Checklist

- [ ] Update all environment variables
- [ ] Configure Gmail App Password for OTP emails
- [ ] Set up HTTPS with proper SSL certificates
- [ ] Configure reverse proxy with security headers
- [ ] Enable database encryption
- [ ] Set up monitoring and alerting
- [ ] Configure backup and disaster recovery
- [ ] Implement IP whitelisting for admin routes
- [ ] Set up Web Application Firewall (WAF)
- [ ] Configure DDoS protection

## 🚨 Emergency Response Plan

If security breach detected:

1. Immediately terminate all user sessions
2. Change all secrets and API keys
3. Review audit logs for compromise scope
4. Notify affected users
5. Implement additional security measures
6. Conduct post-incident review

## 📈 Security Monitoring

Set up alerts for:

- Multiple failed login attempts
- Suspicious IP patterns
- Unusual file upload activity
- Database access anomalies
- API rate limit violations
- Session hijacking attempts
