"use client";
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Lock, AlertTriangle, RefreshCw } from "lucide-react";
import { ClipLoader } from "react-spinners";

interface LoginFormData {
  email: string;
  password: string;
}

interface MathCaptcha {
  question: string;
  answer: number;
}

const generateMathCaptcha = (seed?: number): MathCaptcha => {
  // Use seed for initial server-side rendering to prevent hydration errors
  const random = seed
    ? () => (seed % 20) + 1
    : () => Math.floor(Math.random() * 20) + 1;

  const num1 = random();
  const num2 = random();

  return {
    question: `${num1} + ${num2}`,
    answer: num1 + num2,
  };
};

export default function LoginPage() {
  // Use useEffect to update CAPTCHA only on client-side
  const [captcha, setCaptcha] = useState<MathCaptcha>(() =>
    generateMathCaptcha(1)
  );
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Update CAPTCHA only on client-side after initial render
    setCaptcha(generateMathCaptcha());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const refreshCaptcha = () => {
    setCaptcha(generateMathCaptcha());
    setUserAnswer("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (parseInt(userAnswer) !== captcha.answer) {
      setError("Incorrect answer. Please try again.");
      setIsLoading(false);
      refreshCaptcha();
      return;
    }

    try {
      const result = await signIn("credentials", {
        ...formData,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 sm:px-10 py-8">
            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Lock className="h-8 w-8 text-blue-500" />
              </div>
              <h1 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access your College Management System
              </p>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="mt-6 flex items-center justify-center "
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="••••••••"
                  />
                </div>
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
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Security Check</Label>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">
                        Solve this problem:
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {captcha.question}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={refreshCaptcha}
                      className="h-8 w-8 rounded-full"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id="captcha"
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    required
                    placeholder="Enter your answer"
                    className="mt-4"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full flex justify-center py-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <ClipLoader size={20} color="#ffffff" className="mr-2" />
                ) : null}
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </div>

          <div className="px-6 sm:px-10 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">
                Secure login protected
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
