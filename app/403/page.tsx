"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForbiddenRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the forbidden page
    router.replace("/forbidden");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p>You are being redirected to the access denied page.</p>
      </div>
    </div>
  );
}
