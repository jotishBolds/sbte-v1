import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/src/lib/prisma";
import {
  cleanupUserSession,
  enforcesSingleSession,
  validateSessionToken,
} from "@/lib/session-cleanup";
import { validateCaptcha } from "@/lib/captcha";
import {
  createUserSession,
  terminateUserSession,
  validateUserSession,
  updateUserActivity,
} from "@/lib/enhanced-session-management";
import {
  logAuditEvent,
  logSecurityEvent,
  getClientInfo,
} from "@/lib/audit-logger";

// Configuration constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour

// Database-based rate limiting functions
async function checkAndUpdateFailedAttempts(email: string): Promise<{
  isLocked: boolean;
  remainingTime?: number;
  failedAttempts: number;
}> {
  const currentTime = new Date();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      isLocked: true,
      lockedUntil: true,
      failedLoginAttempts: true,
      lastFailedLoginAt: true,
    },
  });

  if (!user) {
    return { isLocked: false, failedAttempts: 0 };
  }

  // Check if user is currently locked
  if (user.isLocked && user.lockedUntil) {
    if (currentTime < user.lockedUntil) {
      // Still locked
      const remainingTime = Math.ceil(
        (user.lockedUntil.getTime() - currentTime.getTime()) / 1000
      );
      return {
        isLocked: true,
        remainingTime,
        failedAttempts: user.failedLoginAttempts,
      };
    } else {
      // Lock has expired, unlock the user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isLocked: false,
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
      return { isLocked: false, failedAttempts: 0 };
    }
  }

  // Check if we need to reset failed attempts due to time window
  if (user.lastFailedLoginAt) {
    const timeSinceLastFailure =
      currentTime.getTime() - user.lastFailedLoginAt.getTime();
    if (timeSinceLastFailure > ATTEMPT_WINDOW) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0 },
      });
      return { isLocked: false, failedAttempts: 0 };
    }
  }

  return {
    isLocked: false,
    failedAttempts: user.failedLoginAttempts,
  };
}

async function recordFailedAttempt(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const currentTime = new Date();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      failedLoginAttempts: true,
      lockoutCount: true,
    },
  });

  if (!user) return;

  const newFailedAttempts = user.failedLoginAttempts + 1;
  const shouldLock = newFailedAttempts >= MAX_LOGIN_ATTEMPTS;

  const updateData: any = {
    failedLoginAttempts: newFailedAttempts,
    lastFailedLoginAt: currentTime,
  };

  if (shouldLock) {
    updateData.isLocked = true;
    updateData.lockedUntil = new Date(currentTime.getTime() + LOCKOUT_DURATION);
    updateData.lockoutCount = (user.lockoutCount || 0) + 1;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // Log failed login attempt
  if (ipAddress && userAgent) {
    await logSecurityEvent({
      eventType: shouldLock ? "ACCOUNT_LOCKED" : "FAILED_LOGIN_ATTEMPT",
      userId: user.id,
      userEmail: email,
      ipAddress,
      userAgent,
      details: shouldLock
        ? `Account locked after ${newFailedAttempts} failed attempts`
        : `Failed login attempt ${newFailedAttempts}/${MAX_LOGIN_ATTEMPTS}`,
      severity: shouldLock ? "HIGH" : "MEDIUM",
    });
  }
}

async function recordSuccessfulLogin(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const currentTime = new Date();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  await prisma.user.update({
    where: { email },
    data: {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      isLocked: false,
      lockedUntil: null,
      lastLoginAt: currentTime,
      isLoggedIn: true,
    },
  });

  // Log successful login
  if (user && ipAddress && userAgent) {
    await logAuditEvent({
      userId: user.id,
      userEmail: email,
      action: "LOGIN_SUCCESS",
      resource: "USER_AUTHENTICATION",
      details: "User successfully authenticated",
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });
  }
}

// Server-side CAPTCHA validation
async function validateServerCaptcha(
  userAnswer: string,
  hash: string,
  expiresAt: number
): Promise<boolean> {
  return validateCaptcha(userAnswer, hash, expiresAt);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        captchaAnswer: { label: "CAPTCHA Answer", type: "text" },
        captchaExpected: { label: "CAPTCHA Expected", type: "text" },
        captchaExpiresAt: { label: "CAPTCHA Expiry", type: "text" }, // added for expiry
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Get client information for audit logging
        const ipAddress =
          req?.headers?.["x-forwarded-for"]?.toString()?.split(",")[0] ||
          req?.headers?.["x-real-ip"]?.toString() ||
          "unknown";
        const userAgent = req?.headers?.["user-agent"] || "unknown";

        // Check for account lockout
        const lockoutStatus = await checkAndUpdateFailedAttempts(
          credentials.email
        );
        if (lockoutStatus.isLocked) {
          const remainingMinutes = Math.ceil(
            (lockoutStatus.remainingTime || 0) / 60000
          );

          // Log lockout attempt
          await logSecurityEvent({
            eventType: "LOCKED_ACCOUNT_ACCESS_ATTEMPT",
            userEmail: credentials.email,
            ipAddress,
            userAgent,
            details: `Attempt to access locked account. Remaining time: ${remainingMinutes} minutes`,
            severity: "HIGH",
          });

          throw new Error(
            `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`
          );
        }

        // Server-side CAPTCHA validation
        const isCaptchaValid = await validateServerCaptcha(
          credentials.captchaAnswer,
          credentials.captchaExpected,
          Number(credentials.captchaExpiresAt)
        );

        if (!isCaptchaValid) {
          await recordFailedAttempt(credentials.email, ipAddress, userAgent);
          throw new Error("Invalid security check. Please try again.");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { alumnus: true },
          });

          if (!user) {
            await recordFailedAttempt(credentials.email, ipAddress, userAgent);
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            await recordFailedAttempt(credentials.email, ipAddress, userAgent);
            throw new Error("Invalid credentials");
          }

          // Validate OTP
          if (!user.otp || !user.otpExpiresAt) {
            await recordFailedAttempt(credentials.email, ipAddress, userAgent);
            throw new Error("OTP not found or has expired");
          }

          const currentTime = new Date();
          if (user.otpExpiresAt < currentTime) {
            await recordFailedAttempt(credentials.email, ipAddress, userAgent);
            await prisma.user.update({
              where: { id: user.id },
              data: { otp: null, otpExpiresAt: null },
            });
            throw new Error("OTP has expired");
          }

          const otpMatches = user.otp === credentials.otp;
          if (!otpMatches) {
            await recordFailedAttempt(credentials.email, ipAddress, userAgent);
            throw new Error("Invalid OTP");
          }

          // Alumni verification check
          if (
            user.role === "ALUMNUS" &&
            user.alumnus &&
            !user.alumnus.verified
          ) {
            await recordFailedAttempt(credentials.email, ipAddress, userAgent);
            throw new Error("Account not verified");
          }

          // Create enhanced session with single-session enforcement
          const sessionInfo = await createUserSession(
            user.id,
            ipAddress,
            userAgent,
            true // Terminate other sessions
          );

          if (!sessionInfo) {
            throw new Error("Failed to create session");
          }

          // Clear OTP and record successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              otp: null,
              otpExpiresAt: null,
              failedLoginAttempts: 0,
              lastFailedLoginAt: null,
              isLocked: false,
              lockedUntil: null,
            },
          });

          // Record successful login
          await recordSuccessfulLogin(credentials.email, ipAddress, userAgent);

          return {
            id: user.id,
            username: user.username || "",
            email: user.email,
            role: user.role,
            collegeId: user.collegeId || "",
            departmentId: user.departmentId || "",
          };
        } catch (error) {
          console.error(
            `Authentication failed for ${credentials.email}:`,
            error
          );
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Set basic token properties first
        token.id = user.id;
        token.role = user.role;
        token.username = user.username || "";
        token.collegeId = user.collegeId || "";
        token.departmentId = user.departmentId || "";

        // Get the current session token from database for concurrent session checking
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { sessionToken: true, isLoggedIn: true },
          });

          if (dbUser?.sessionToken) {
            token.sessionToken = dbUser.sessionToken;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              isLoggedIn: true,
              lastLoginAt: new Date(),
            },
          });
        } catch (error) {
          console.error("Error updating login status (non-critical):", error);
          // Continue - basic auth will still work
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        // Check if user still has a valid session (concurrent session protection)
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              isLoggedIn: true,
              sessionToken: true,
              sessionExpiresAt: true,
              lastActivity: true,
            },
          });

          // If user is not logged in, force logout
          if (!user || !user.isLoggedIn) {
            console.log(`User ${token.id} session invalid - not logged in`);
            throw new Error("Session invalid");
          }

          // Check if session token matches (concurrent session detection)
          if (
            user.sessionToken &&
            token.sessionToken &&
            user.sessionToken !== token.sessionToken
          ) {
            console.log(
              `User ${token.id} concurrent session detected - tokens don't match`
            );
            await logSecurityEvent({
              eventType: "CONCURRENT_SESSION_DETECTED",
              userId: token.id as string,
              ipAddress: "unknown",
              userAgent: "unknown",
              details: "Concurrent session detected during session validation",
              severity: "HIGH",
            });
            throw new Error("Concurrent session detected");
          }

          // Check session expiry
          if (user.sessionExpiresAt && new Date() > user.sessionExpiresAt) {
            console.log(`User ${token.id} session expired`);
            await prisma.user.update({
              where: { id: token.id as string },
              data: { isLoggedIn: false, sessionToken: null },
            });
            throw new Error("Session expired");
          }

          // Update user activity for valid sessions
          await updateUserActivity(token.id as string);

          // Set session properties for valid sessions
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.username = token.username as string;
          session.user.collegeId = token.collegeId as string;
          session.user.departmentId = token.departmentId as string;
        } catch (error) {
          console.error("Session validation failed:", error);
          // Return minimal session to trigger logout
          return {
            ...session,
            user: undefined,
            expires: new Date(0).toISOString(), // Force immediate expiry
          };
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after successful login
      console.log(
        "NextAuth redirect callback - url:",
        url,
        "baseUrl:",
        baseUrl
      );

      // If url is relative, make it absolute
      if (url.startsWith("/")) {
        const absoluteUrl = `${baseUrl}${url}`;
        console.log("Redirecting to relative URL:", absoluteUrl);
        return absoluteUrl;
      }

      // If url is on the same domain, allow it
      if (url.startsWith(baseUrl)) {
        console.log("Redirecting to same domain URL:", url);
        return url;
      }

      // Default redirect to dashboard for security
      const defaultRedirect = `${baseUrl}/dashboard`;
      console.log("Redirecting to default dashboard:", defaultRedirect);
      return defaultRedirect;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        // Use enhanced session termination
        await terminateUserSession(
          token.id as string,
          "signout",
          "nextauth",
          "User initiated logout"
        );

        // Also cleanup for compatibility
        await cleanupUserSession(token.id as string);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Enable debug only in development, but you can set NEXTAUTH_DEBUG=false to disable
  debug:
    process.env.NODE_ENV === "development" &&
    process.env.NEXTAUTH_DEBUG !== "false",
};
