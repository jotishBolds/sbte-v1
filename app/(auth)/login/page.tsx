"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] ">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-10 py-12">
            <div className="text-center mb-8">
              <Lock className="mx-auto h-12 w-12 text-blue-500" />
              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access your College Management System account
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
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
              >
                Sign In
              </Button>
            </form>
          </div>
          <div className="px-10 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
            <div className="mt-3 sm:mt-0 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-xs text-gray-600">Secure login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
