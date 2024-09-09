// src/app/api/auth/[...nextauth]/auth-options.ts

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

import { compare } from "bcrypt";
import prisma from "@/src/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { alumnus: true },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }
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
  // In the callbacks section
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.id;
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
