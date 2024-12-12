import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

import { compare } from "bcryptjs";
import prisma from "@/src/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.otp) {
          return null; // OTP is required
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { alumnus: true },
        });

        if (!user) {
          return null;
        }

        // Password-based authentication
        if (credentials.password) {
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }
        }

        // OTP-based authentication
        if (!user.otp || !user.otpExpiresAt) {
          return null; // OTP not generated or expired
        }

        const currentTime = new Date();

        // Check if OTP has expired
        if (user.otpExpiresAt < currentTime) {
          return null;
        }

        // Check if OTP matches
        if (user.otp !== credentials.otp) {
          return null;
        }

        // Clear OTP after successful verification
        await prisma.user.update({
          where: { id: user.id },
          data: {
            otp: null,
            otpExpiresAt: null,
          },
        });

        // Additional verification for alumni
        if (user.role === "ALUMNUS" && user.alumnus && !user.alumnus.verified) {
          throw new Error("Account not verified");
        }

        return {
          id: user.id,
          username: user.username || "",
          collegeId: user.collegeId || "",
          departmentId: user.departmentId || "",
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.collegeId = user.collegeId;
        token.departmentId = user.departmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.collegeId = token.collegeId as string;
        session.user.departmentId = token.departmentId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
