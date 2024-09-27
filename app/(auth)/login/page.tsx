"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Lock, AlertTriangle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { ClipLoader } from "react-spinners";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!captchaValue) {
      setError("Please complete the CAPTCHA");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        ...formData,
        captcha: captchaValue,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "Account not verified") {
          setError(
            "Your alumni account has not been verified yet. Please check back later or contact the administrator."
          );
        } else {
          setError("Invalid email or password. Please try again.");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="px-6 sm:px-10 py-12">
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
                <AlertTriangle className="h-4 w-4 mr-2" />
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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full"
                  placeholder="you@example.com"
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
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
              <div className="flex justify-start">
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={(value) => setCaptchaValue(value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <ClipLoader size={20} color="#ffffff" className="mr-2" />
                ) : null}
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </div>
          <div className="px-6 sm:px-10 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
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
