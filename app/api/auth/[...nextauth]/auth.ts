import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/src/lib/prisma";
import { cleanupUserSession } from "@/lib/session-cleanup";
import { validateCaptcha } from "@/lib/captcha";

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

async function recordFailedAttempt(email: string): Promise<void> {
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
}

async function recordSuccessfulLogin(email: string): Promise<void> {
  const currentTime = new Date();

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
}

// Server-side CAPTCHA validation
async function validateServerCaptcha(
  userAnswer: string,
  hash: string
): Promise<boolean> {
  return validateCaptcha(userAnswer, hash);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
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
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Check for account lockout
        const lockoutStatus = await checkAndUpdateFailedAttempts(
          credentials.email
        );
        if (lockoutStatus.isLocked) {
          const remainingMinutes = Math.ceil(
            (lockoutStatus.remainingTime || 0) / 60000
          );
          throw new Error(
            `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`
          );
        }

        // Server-side CAPTCHA validation
        const isCaptchaValid = await validateServerCaptcha(
          credentials.captchaAnswer,
          credentials.captchaExpected
        );

        if (!isCaptchaValid) {
          await recordFailedAttempt(credentials.email);
          throw new Error("Invalid CAPTCHA. Please try again.");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { alumnus: true },
          });

          if (!user) {
            await recordFailedAttempt(credentials.email);
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            await recordFailedAttempt(credentials.email);
            throw new Error("Invalid credentials");
          }

          // Validate OTP
          if (!user.otp || !user.otpExpiresAt) {
            await recordFailedAttempt(credentials.email);
            throw new Error("OTP not found or has expired");
          }

          const currentTime = new Date();
          if (user.otpExpiresAt < currentTime) {
            await recordFailedAttempt(credentials.email);
            await prisma.user.update({
              where: { id: user.id },
              data: { otp: null, otpExpiresAt: null },
            });
            throw new Error("OTP has expired");
          }

          const otpMatches = user.otp === credentials.otp;
          if (!otpMatches) {
            await recordFailedAttempt(credentials.email);
            throw new Error("Invalid OTP");
          }

          // Alumni verification check
          if (
            user.role === "ALUMNUS" &&
            user.alumnus &&
            !user.alumnus.verified
          ) {
            await recordFailedAttempt(credentials.email);
            throw new Error("Account not verified");
          } // Clear OTP and record successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              otp: null,
              otpExpiresAt: null,
              isLoggedIn: true,
              lastLoginAt: new Date(),
              failedLoginAttempts: 0,
              lastFailedLoginAt: null,
              isLocked: false,
              lockedUntil: null,
            },
          });

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
        token.id = user.id;
        token.role = user.role;
        token.username = user.username || "";
        token.collegeId = user.collegeId || "";
        token.departmentId = user.departmentId || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isLoggedIn: true },
        });

        if (!dbUser?.isLoggedIn) {
          throw new Error("Session expired");
        }

        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.collegeId = token.collegeId as string;
        session.user.departmentId = token.departmentId as string;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await cleanupUserSession(token.id as string);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};
