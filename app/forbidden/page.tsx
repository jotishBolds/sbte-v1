"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Shield } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[90vh] flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-6">
            <Shield className="mx-auto h-24 w-24 text-red-500" />
          </div>
          <h1 className="text-9xl font-extrabold mb-4 text-red-500">403</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Access Forbidden
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            You don&apos;t have permission to access this resource. This might
            be due to:
          </p>
          <div className="text-left mb-8 max-w-md mx-auto">
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Insufficient privileges for your current role</li>
              <li>Session expiration - please log in again</li>
              <li>Concurrent session detected</li>
              <li>Security policy violation</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                <Shield className="mr-2 h-5 w-5" /> Login Again
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Home className="mr-2 h-5 w-5" /> Go Home
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Go Back
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 md:px-8">
        <p>&copy; 2024 SBTE. All rights reserved.</p>
      </footer>
    </div>
  );
}
