"use client";
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Lock,
  RefreshCw,
  KeyRound,
  Mail,
  TimerReset,
  AlertCircle,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useTheme } from "next-themes";
import { ForgotPasswordModal } from "./forgot-pass";

interface LoginFormData {
  email: string;
  password: string;
  otp?: string;
}

interface MathCaptcha {
  question: string;
  answer: number;
}

const generateMathCaptcha = (seed?: number): MathCaptcha => {
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
  const { theme } = useTheme();
  const [captcha, setCaptcha] = useState<MathCaptcha>(() =>
    generateMathCaptcha(1)
  );
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    otp: "",
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otpResendCountdown, setOtpResendCountdown] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState<boolean>(false);
  const router = useRouter();

  // OTP Resend Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpResendCountdown > 0) {
      timer = setInterval(() => {
        setOtpResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpResendCountdown]);

  useEffect(() => {
    setCaptcha(generateMathCaptcha());
  }, []);

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({ ...prev, [name]: value }));
  };

  const refreshCaptcha = () => {
    setCaptcha(generateMathCaptcha());
    setUserAnswer("");
  };

  const handleSendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!loginFormData.email) {
      setError("Please enter an email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/loginOtp/sendOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginFormData.email,
          purpose: "login",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errorCode === "OTP_THROTTLED") {
          const waitTime = Math.ceil(result.waitTime);
          setOtpResendCountdown(waitTime);
          setError(
            `Please wait ${waitTime} seconds before requesting a new OTP.`
          );
        } else {
          setError(result.error || "Failed to send OTP");
        }
      } else {
        setSuccessMessage("OTP has been sent to your email.");
        setOtpResendCountdown(30);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Enhanced validation
    if (!loginFormData.email || !loginFormData.password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    if (!loginFormData.otp || loginFormData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setIsLoading(false);
      return;
    }

    if (parseInt(userAnswer) !== captcha.answer) {
      setError("Incorrect security answer. Please try again.");
      setIsLoading(false);
      refreshCaptcha();
      return;
    }

    try {
      const result = await signIn("credentials", {
        ...loginFormData,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "Account not verified") {
          setError(
            "Your alumni account has not been verified. Contact the administrator."
          );
        } else {
          setError("Invalid login credentials. Please try again.");
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
    <div className="min-h-[90vh]  flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl mx-auto shadow-2xl ">
        <CardHeader className="space-y-2 text-center">
          <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-16 h-16 mx-auto flex items-center justify-center animate-pulse">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Secure Login
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Access your College Management System
          </CardDescription>
        </CardHeader>

        {(error || successMessage) && (
          <Alert
            variant={error ? "destructive" : "default"}
            className="mx-6 mb-4 w-auto"
          >
            {error ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertTitle>{error ? "Error" : "Success"}</AlertTitle>
            <AlertDescription>{error || successMessage}</AlertDescription>
          </Alert>
        )}

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={loginFormData.email}
                  onChange={handleLoginInputChange}
                  required
                  placeholder="you@example.com"
                  className="focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={loginFormData.password}
                  onChange={handleLoginInputChange}
                  required
                  placeholder="••••••••"
                  className="focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <div className="flex space-x-2 items-end">
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={loginFormData.otp}
                    onChange={handleLoginInputChange}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    className="focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSendOtp}
                    disabled={
                      !loginFormData.email ||
                      isLoading ||
                      otpResendCountdown > 0
                    }
                    className=" flex items-center space-x-1"
                  >
                    {otpResendCountdown > 0 ? (
                      <>
                        <TimerReset className="mr-1 h-4 w-4" />
                        {otpResendCountdown}s
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
              <Button
                variant="link"
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Security Check</Label>
              <div className="bg-muted/50 dark:bg-muted rounded-lg p-6 space-y-4 border border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">
                      Solve this problem:
                    </p>
                    <p className="text-2xl font-bold">{captcha.question}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={refreshCaptcha}
                    className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors"
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
                  className=" bg-primary-foreground dark:text-white focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full "
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <ClipLoader size={20} color="currentColor" className="mr-2" />
              ) : null}
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-muted/50 flex items-center justify-center space-x-2 py-4 rounded-b-lg">
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Secure login protected
          </span>
        </CardFooter>
      </Card>
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onOpenChange={setIsForgotPasswordModalOpen}
      />
    </div>
  );
}
