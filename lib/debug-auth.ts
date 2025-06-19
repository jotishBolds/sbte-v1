// Debugging utility for NextAuth session issues
// Use this to test basic authentication without complex session management

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/src/lib/prisma";

export const debugAuthOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { alumnus: true },
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          // Validate OTP
          if (!user.otp || !user.otpExpiresAt) {
            throw new Error("OTP not found or has expired");
          }

          const currentTime = new Date();
          if (user.otpExpiresAt < currentTime) {
            await prisma.user.update({
              where: { id: user.id },
              data: { otp: null, otpExpiresAt: null },
            });
            throw new Error("OTP has expired");
          }

          const otpMatches = user.otp === credentials.otp;
          if (!otpMatches) {
            throw new Error("Invalid OTP");
          }

          // Clear OTP on successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              otp: null,
              otpExpiresAt: null,
              isLoggedIn: true,
              lastLoginAt: new Date(),
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
          console.error(`Debug auth failed for ${credentials.email}:`, error);
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
      if (session?.user && token?.id) {
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
        try {
          await prisma.user.update({
            where: { id: token.id as string },
            data: {
              isLoggedIn: false,
              lastLogout: new Date(),
            },
          });
        } catch (error) {
          console.error("Error during sign out:", error);
        }
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: true, // Enable debug mode
};

export default debugAuthOptions;
