"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { UserPlus, CheckCircle2, ArrowLeft } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useTheme } from "next-themes";

class RegistrationError extends Error {
  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = "RegistrationError";

    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
        scope.setLevel("error");
        Sentry.captureException(this);
      });
    }
  }
}

export default function RegisterPage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      const errorMessage = "Passwords do not match. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      Sentry.captureException(
        new RegistrationError(errorMessage, {
          username: formData.username,
          email: formData.email,
          errorType: "password_mismatch",
        })
      );
      return;
    }

    try {
      await Sentry.startSpan(
        {
          name: "User Registration",
          op: "auth",
        },
        async () => {
          const response = await fetch("/api/sbte-auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: formData.username,
              email: formData.email,
              password: formData.password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage =
              errorData.message || "Registration failed. Please try again.";
            throw new RegistrationError(errorMessage, {
              username: formData.username,
              email: formData.email,
              status: response.status,
              errorData: errorData,
            });
          }

          // Registration successful
          router.push("/login");
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof RegistrationError) {
        setError(error.message);
      } else {
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        Sentry.captureException(
          new RegistrationError(errorMessage, {
            username: formData.username,
            email: formData.email,
            errorType: "unexpected_error",
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription>Join the College Management System</CardDescription>
        </CardHeader>

        {error && (
          <Alert
            variant="destructive"
            className="mx-6 mb-4 flex items-center justify-center"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="sbte username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@sbte.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <ClipLoader size={20} color="currentColor" className="mr-2" />
              ) : null}
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-muted/50 flex flex-col sm:flex-row items-center justify-between py-4">
          <Link
            href="/login"
            className="flex items-center text-sm text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
          <div className="mt-3 sm:mt-0 flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
            <span className="text-sm text-muted-foreground">
              Secure registration
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
