// lib/session-utils.ts
// Enhanced session utilities to prevent fallback user states

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

/**
 * Server-side session validation with redirect
 * Use this in server components and pages
 */
export async function validateServerSession() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login?reason=session_required");
  }

  return session;
}

/**
 * Client-side session validation hook
 * Use this in client components
 */
export function useValidatedSession() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (
      status === "unauthenticated" ||
      !session ||
      !session.user ||
      !session.user.id
    ) {
      router.push("/login?reason=session_invalid");
    }
  }, [session, status, router]);

  return { session, status };
}

/**
 * Enhanced user display name with fallbacks
 */
export function getUserDisplayName(user: any): string {
  if (!user) return "Guest";

  return (
    user.username || user.name || user.email?.split("@")[0] || "Unknown User"
  );
}

/**
 * Enhanced user avatar initials
 */
export function getUserInitials(user: any): string {
  if (!user) return "?";

  const name = user.username || user.name || user.email;
  if (!name) return "?";

  if (name.includes(" ")) {
    const parts = name.split(" ");
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}
