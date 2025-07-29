import React, { useState, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Shield,
  Key,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useCaptcha } from "@/hooks/use-captcha";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

class ForgotPasswordError extends Error {
  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = "ForgotPasswordError";

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

// Password validation helper
const validatePassword = (password: string): string[] => {
  const errors = [];
  if (password.length < 8) errors.push("At least 8 characters long");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/\d/.test(password)) errors.push("One number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.push("One special character");
  return errors;
};

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function ForgotPasswordModal({
  isOpen,
  onOpenChange,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  // const { captcha, captchaToken, resetCaptcha, verifyCaptcha } = useCaptcha();
  const { captcha, resetCaptcha, verifyCaptcha } = useCaptcha();
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("");

  useEffect(() => {
    if (!captcha?.expiresAt) return;

    const now = Date.now();
    const timeUntilExpiry = captcha.expiresAt - now;

    if (timeUntilExpiry <= 0) {
      resetCaptcha();
      return;
    }

    const timeout = setTimeout(() => {
      resetCaptcha();
    }, timeUntilExpiry);

    return () => clearTimeout(timeout);
  }, [captcha?.expiresAt, resetCaptcha]);

  // Timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("email");
      setError("");
      setSuccessMessage("");
      setEmailError("");
      setPasswordErrors([]);
      setCaptchaAnswer("");
      setOtpTimer(0);
      resetCaptcha();
    }
  }, [isOpen, resetCaptcha]);

  // Email validation on change
  useEffect(() => {
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  }, [email]);

  // Password validation on change
  useEffect(() => {
    if (newPassword) {
      setPasswordErrors(validatePassword(newPassword));
    } else {
      setPasswordErrors([]);
    }
  }, [newPassword]);
  const handleInitiateReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate CAPTCHA input exists
    if (!captcha || !captchaAnswer.trim()) {
      setError("Please answer the security question");
      return;
    }

    setIsLoading(true);

    try {
      // Verify CAPTCHA first
      // const isValid = await verifyCaptcha(captchaAnswer.trim());
      // if (!isValid) {
      //   setError("Incorrect security answer. Please try again.");
      //   resetCaptcha();
      //   setCaptchaAnswer("");
      //   setIsLoading(false);
      //   return;
      // }

      await Sentry.startSpan(
        {
          name: "Initiate Password Reset",
          op: "http",
        },
        async () => {
          const response = await fetch("/api/password-reset/initiate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              answer: captchaAnswer.trim(),
              hash: captcha?.hash,
              expiresAt: captcha?.expiresAt,
            }),

            // body: JSON.stringify({
            //   email,
            //   captchaToken,
            //   captchaAnswer: captchaAnswer.trim(),
            // }),
          });

          const result = await response.json();

          if (!response.ok) {
            if (result.error === "INVALID_CAPTCHA") {
              resetCaptcha();
              setCaptchaAnswer("");
              throw new ForgotPasswordError(
                "Incorrect security answer. Please try again.",
                {
                  email,
                  status: response.status,
                }
              );
            }
            throw new ForgotPasswordError(
              result.error ||
                "Failed to initiate password reset. Please try again.",
              {
                email,
                status: response.status,
              }
            );
          }

          setSuccessMessage(
            "OTP has been sent to your email. Please check your inbox."
          );
          setStep("otp");
          setOtpTimer(300); // 5 minutes timer
        }
      );
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof ForgotPasswordError) {
        setError(error.message);
      } else if (
        error instanceof TypeError &&
        error.message.includes("fetch")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
        Sentry.captureException(error, {
          tags: {
            component: "ForgotPasswordModal",
            step: "initiate",
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate OTP format first
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    // Ensure we have all required data
    if (!email) {
      setError("Missing email information. Please start over.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/password-reset/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errorCode === "INVALID_OTP") {
          throw new ForgotPasswordError(
            result.error ||
              "Invalid or expired OTP. Please request a new code.",
            {
              email,
              status: response.status,
              errorCode: result.errorCode,
            }
          );
        }
        throw new ForgotPasswordError(
          result.error || "Failed to verify OTP. Please try again.",
          {
            email,
            status: response.status,
            errorCode: result.errorCode,
          }
        );
      }

      setStep("newPassword");
      setSuccessMessage(
        "OTP verified successfully. Please set your new password."
      );
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error instanceof ForgotPasswordError) {
        setError(error.message);
        if (error.message.includes("expired")) {
          setOtp("");
        }
      } else if (
        error instanceof TypeError &&
        error.message.includes("fetch")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to verify OTP. Please try again.");
        Sentry.captureException(error, {
          tags: {
            component: "ForgotPasswordModal",
            step: "verify-otp",
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate password
    if (passwordErrors.length > 0) {
      setError("Please fix the password errors before proceeding");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await Sentry.startSpan(
        {
          name: "Reset Password",
          op: "http",
        },
        async () => {
          const response = await fetch("/api/password-reset/reset", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              otp,
              newPassword,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new ForgotPasswordError(
              result.error || "Failed to reset password. Please try again.",
              {
                email,
                status: response.status,
              }
            );
          }

          // Show success message
          setSuccessMessage(
            "Password reset successful! You will be redirected to login in a moment."
          );

          // Wait for 2 seconds to show the success message before closing
          setTimeout(() => {
            onOpenChange(false); // Close the modal
          }, 2000);
        }
      );
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof ForgotPasswordError) {
        setError(error.message);
      } else if (
        error instanceof TypeError &&
        error.message.includes("fetch")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
        Sentry.captureException(error, {
          tags: {
            component: "ForgotPasswordModal",
            step: "reset",
          },
          extra: {
            error:
              typeof error === "object" && error !== null
                ? JSON.stringify(error)
                : String(error),
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Forgot Password
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {step === "email" &&
              "Enter your email to receive the password reset OTP."}
            {step === "otp" && "Enter the OTP sent to your email."}
            {step === "newPassword" && "Enter your new password."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="default" className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {step === "email" && (
          <form onSubmit={handleInitiateReset}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="captcha">Captcha</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="captcha"
                      type="text"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Enter captcha answer"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={resetCaptcha}
                    disabled={isLoading}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    <RefreshCw className="mr-2 h-4 w-4 " />
                    Refresh
                  </Button>
                </div>{" "}
                {captcha && (
                  <div className="mt-2 rounded-md border bg-muted p-2 text-center text-sm">
                    {captcha.question}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Send OTP"
              )}
            </Button>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Remembered your password?{" "}
              <Button
                variant="link"
                onClick={() => {
                  onOpenChange(false);
                }}
                className="p-0"
              >
                Log in
              </Button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the OTP"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              <Button
                variant="link"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setSuccessMessage("");
                }}
                className="p-0"
              >
                Resend OTP
              </Button>
            </div>
          </form>
        )}

        {step === "newPassword" && (
          <form onSubmit={handleResetPassword}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  variant="link"
                  className="absolute right-3 top-10"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
                {passwordErrors.length > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    {passwordErrors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <Button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  variant="link"
                  className="absolute right-3 top-10"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
