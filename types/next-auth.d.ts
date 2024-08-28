import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      collegeId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    collegeId?: string;
  }
}
