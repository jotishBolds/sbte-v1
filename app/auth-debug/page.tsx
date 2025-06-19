"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("Auth Debug - Session status:", status);
    console.log("Auth Debug - Session data:", session);
  }, [session, status]);

  if (status === "loading") {
    return <div>Loading authentication...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>User ID:</strong> {session?.user?.id}
        </div>
        <div>
          <strong>Email:</strong> {session?.user?.email}
        </div>
        <div>
          <strong>Role:</strong> {session?.user?.role}
        </div>
        <div>
          <strong>Username:</strong> {session?.user?.username}
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-green-500 text-white px-4 py-2 rounded mr-4"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
        <div className="mt-6">
          <h3 className="font-bold">Full Session Object:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
