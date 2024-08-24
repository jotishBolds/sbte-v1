"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, CheckCircle2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    const response = await fetch("/api/sbte-auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      router.push("/login");
    } else {
      const errorData = await response.json();
      setError(errorData.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh]">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-10 py-12">
            <div className="text-center mb-8">
              <UserPlus className="mx-auto h-12 w-12 text-blue-500" />
              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                Create an Account
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Join the College Management System
              </p>
            </div>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full"
                  placeholder="you@sbte.com"
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 block w-full"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
              >
                Register
              </Button>
            </form>
          </div>
          <div className="px-10 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
            <Link
              href="/login"
              className="flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
            <div className="mt-3 sm:mt-0 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-xs text-gray-600">Secure registration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
