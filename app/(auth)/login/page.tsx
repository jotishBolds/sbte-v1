"use client";
import React, { useState, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Shield,
  Clock,
  Ban,
  Eye,
  EyeOff,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useTheme } from "next-themes";
import { ForgotPasswordModal } from "./forgot-pass";
import SessionLogoutModal from "@/components/session-logout-modal";

interface LoginFormData {
  email: string;
  password: string;
  otp?: string;
  captchaAnswer?: string;
  captchaHash?: string;
}

interface CaptchaResponse {
  question: string;
  hash: string;
  expiresAt: number; //added this new for security issue
}

interface AccountLockInfo {
  isLocked: boolean;
  lockedUntil?: string;
  remainingTime?: number;
  failedAttempts?: number;
  maxAttempts?: number;
}

class LoginError extends Error {
  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = "LoginError";

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

const fetchCaptcha = async (): Promise<CaptchaResponse> => {
  const response = await fetch("/api/auth/captcha");
  if (!response.ok) {
    throw new Error("Failed to fetch CAPTCHA");
  }
  return response.json();
};

const checkAccountLockStatus = async (
  email: string
): Promise<AccountLockInfo> => {
  if (!email) return { isLocked: false };

  try {
    const response = await fetch("/api/auth/check-lock-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      return await response.json();
    }

    return { isLocked: false };
  } catch (error) {
    console.error("Error checking account lock status:", error);
    return { isLocked: false };
  }
};

// Helper function to parse NextAuth error messages
const parseAuthError = (
  errorMessage: string
): { isLocked: boolean; message: string; remainingTime?: number } => {
  if (errorMessage.includes("temporarily locked")) {
    // Extract remaining time from error message
    const timeMatch = errorMessage.match(/(\d+)\s+minutes?/);
    const remainingMinutes = timeMatch ? parseInt(timeMatch[1]) : 0;

    return {
      isLocked: true,
      message: errorMessage,
      remainingTime: remainingMinutes * 60, // Convert to seconds
    };
  }

  return {
    isLocked: false,
    message: errorMessage,
  };
};

export default function LoginPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    otp: "",
    captchaAnswer: "",
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOtpLoading, setIsOtpLoading] = useState<boolean>(false);
  const [otpResendCountdown, setOtpResendCountdown] = useState<number>(0);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState<boolean>(false);
  const [accountLockInfo, setAccountLockInfo] = useState<AccountLockInfo>({
    isLocked: false,
  });
  const [lockdownCountdown, setLockdownCountdown] = useState<number>(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Concurrent session modal state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionModalData, setSessionModalData] = useState<{
    userId?: string;
    userEmail?: string;
    lastActivity?: string;
  }>({});
  const [isSessionModalLoading, setIsSessionModalLoading] = useState(false);

  // Check for NextAuth error in URL parameters
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      const decodedError = decodeURIComponent(urlError);
      const errorInfo = parseAuthError(decodedError);

      if (errorInfo.isLocked) {
        setAccountLockInfo({
          isLocked: true,
          remainingTime: errorInfo.remainingTime,
        });

        if (errorInfo.remainingTime) {
          setLockdownCountdown(errorInfo.remainingTime);
        }
      }

      setError(errorInfo.message);

      // Clear the error from URL without page reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  // Account lockdown countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockdownCountdown > 0) {
      timer = setInterval(() => {
        setLockdownCountdown((prev) => {
          if (prev <= 1) {
            // Re-check account status when countdown reaches 0
            if (loginFormData.email) {
              checkAccountLockStatus(loginFormData.email).then((lockInfo) => {
                setAccountLockInfo(lockInfo);
                if (!lockInfo.isLocked) {
                  setError(""); // Clear error when account is unlocked
                }
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockdownCountdown, loginFormData.email]);

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
    const loadCaptcha = async () => {
      try {
        // Clear any existing CAPTCHA data first
        setCaptcha(null);
        setLoginFormData((prev) => ({
          ...prev,
          captchaAnswer: "",
          captchaHash: "",
          captchaExpiresAt: 0, //added this new for security issue
        }));

        const newCaptcha = await fetchCaptcha();
        setCaptcha(newCaptcha);
        setLoginFormData((prev) => ({
          ...prev,
          captchaHash: newCaptcha.hash,
          captchaExpiresAt: newCaptcha.expiresAt,
        }));
      } catch (error) {
        console.error("Failed to load CAPTCHA:", error);
        setError("Failed to load security check. Please refresh the page.");
      }
    };

    // Load CAPTCHA when component mounts
    loadCaptcha();

    // Refresh CAPTCHA periodically (every 4 minutes to prevent expiration)
    const refreshInterval = setInterval(loadCaptcha, 4 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Check account lock status when email changes
  useEffect(() => {
    const checkLockStatus = async () => {
      if (loginFormData.email && loginFormData.email.includes("@")) {
        const lockInfo = await checkAccountLockStatus(loginFormData.email);
        setAccountLockInfo(lockInfo);

        if (lockInfo.isLocked && lockInfo.remainingTime) {
          setLockdownCountdown(lockInfo.remainingTime);
        }
      }
    };

    const debounceTimer = setTimeout(checkLockStatus, 500);
    return () => clearTimeout(debounceTimer);
  }, [loginFormData.email]);

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({ ...prev, [name]: value }));
  };

  const refreshCaptcha = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      const newCaptcha = await fetchCaptcha();
      setCaptcha(newCaptcha);
      setLoginFormData((prev) => ({
        ...prev,
        captchaAnswer: "",
        captchaHash: newCaptcha.hash,
        captchaExpiresAt: newCaptcha.expiresAt,
      }));
    } catch (error) {
      setError("Failed to refresh security check. Please try again.");
    }
  };

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setError("");
    setSuccessMessage("");
    setIsOtpLoading(true);

    if (!loginFormData.email) {
      setError("Please enter an email address");
      setIsOtpLoading(false);
      return;
    }

    // Check if account is locked before sending OTP
    if (accountLockInfo.isLocked) {
      setError(
        `Account is temporarily locked. Please wait ${Math.ceil(
          lockdownCountdown / 60
        )} minutes before trying again.`
      );
      setIsOtpLoading(false);
      return;
    }

    try {
      await Sentry.startSpan(
        {
          name: "Send OTP",
          op: "http",
        },
        async () => {
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
              throw new LoginError(
                `Please wait ${waitTime} seconds before requesting a new OTP.`,
                {
                  errorCode: result.errorCode,
                  email: loginFormData.email,
                  waitTime,
                }
              );
            } else if (result.errorCode === "ACCOUNT_LOCKED") {
              const lockInfo = await checkAccountLockStatus(
                loginFormData.email
              );
              setAccountLockInfo(lockInfo);
              if (lockInfo.remainingTime) {
                setLockdownCountdown(lockInfo.remainingTime);
              }
              throw new LoginError(result.error, {
                errorCode: result.errorCode,
                email: loginFormData.email,
              });
            } else {
              throw new LoginError(result.error || "Failed to send OTP", {
                email: loginFormData.email,
                status: response.status,
              });
            }
          } else {
            setSuccessMessage("OTP has been sent to your email.");
            setOtpResendCountdown(60); // Set to 1 minute cooldown
          }
        }
      );
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error instanceof LoginError) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
        Sentry.captureException(error, {
          tags: {
            component: "LoginPage",
            action: "handleSendOtp",
          },
          extra: {
            email: loginFormData.email,
          },
        });
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Check if account is locked
      if (accountLockInfo.isLocked) {
        setError(
          `Account is temporarily locked due to multiple failed login attempts. Please wait ${Math.ceil(
            lockdownCountdown / 60
          )} minutes before trying again.`
        );
        setIsLoading(false);
        return;
      }

      // Comprehensive validation of all required authentication parameters
      const validationErrors = [];

      // Email validation
      if (!loginFormData.email?.trim()) {
        validationErrors.push("Email is required");
      } else if (
        !loginFormData.email.includes("@") ||
        !loginFormData.email.includes(".")
      ) {
        validationErrors.push("Please enter a valid email address");
      }

      // Password validation - enhanced security checks
      if (!loginFormData.password) {
        validationErrors.push("Password parameter is missing");
      } else if (typeof loginFormData.password !== "string") {
        validationErrors.push("Invalid password format");
      } else if (loginFormData.password.trim() === "") {
        validationErrors.push("Password cannot be empty");
      } else if (loginFormData.password.length < 8) {
        validationErrors.push("Password must be at least 8 characters long");
      }

      // OTP validation
      if (!loginFormData.otp?.trim()) {
        validationErrors.push("OTP is required");
      } else if (!/^\d{6}$/.test(loginFormData.otp)) {
        validationErrors.push("OTP must be 6 digits");
      }

      // CAPTCHA validation
      if (!loginFormData.captchaAnswer?.trim()) {
        validationErrors.push("Security check answer is required");
      }

      if (!loginFormData.captchaHash) {
        validationErrors.push("Invalid security check session");
      }

      // If any validation errors exist, throw them
      if (validationErrors.length > 0) {
        throw new LoginError(validationErrors[0], {
          email: loginFormData.email,
          errorType: "validation_error",
          validationErrors,
        });
      }

      // After all validations pass, check for active sessions
      try {
        const sessionCheckResponse = await fetch(
          "/api/auth/check-active-session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginFormData.email }),
          }
        );

        if (sessionCheckResponse.ok) {
          const sessionData = await sessionCheckResponse.json();

          if (sessionData.hasActiveSession) {
            // Show modal for concurrent session
            setSessionModalData({
              userId: sessionData.userId,
              userEmail: loginFormData.email,
              lastActivity: sessionData.lastActivity,
            });
            setShowSessionModal(true);
            setIsLoading(false);
            return;
          }
        }
      } catch (sessionCheckError) {
        console.warn(
          "Session check failed, proceeding with login:",
          sessionCheckError
        );
        // Continue with login even if session check fails
      }

      // After all validations pass, proceed with authentication
      await Sentry.startSpan(
        {
          name: "User Login",
          op: "auth",
        },
        async () => {
          const result = await signIn("credentials", {
            ...loginFormData,
            captchaExpected: captcha?.hash,
            captchaExpiresAt: captcha?.expiresAt, // added this for expiry validation
            redirect: false,
          });

          if (result?.error) {
            // If the error indicates CAPTCHA expiration, refresh it and show appropriate message
            if (result.error.includes("Security check has expired")) {
              try {
                const newCaptcha = await fetchCaptcha();
                setCaptcha(newCaptcha);
                setLoginFormData((prev) => ({ ...prev, captchaAnswer: "" }));
                throw new LoginError(
                  "Security check has been refreshed. Please complete it and try again."
                );
              } catch (refreshError) {
                throw new LoginError(
                  "Failed to refresh security check. Please reload the page."
                );
              }
            }

            // Parse the error to check if it's an account lock
            const errorInfo = parseAuthError(result.error);

            if (errorInfo.isLocked) {
              // Update account lock info based on error
              setAccountLockInfo({
                isLocked: true,
                remainingTime: errorInfo.remainingTime,
              });

              if (errorInfo.remainingTime) {
                setLockdownCountdown(errorInfo.remainingTime);
              }

              // Also refresh from API to get accurate data
              const lockInfo = await checkAccountLockStatus(
                loginFormData.email
              );
              setAccountLockInfo(lockInfo);

              if (lockInfo.remainingTime) {
                setLockdownCountdown(lockInfo.remainingTime);
              }

              throw new LoginError(errorInfo.message, {
                email: loginFormData.email,
                errorType: "account_locked",
                failedAttempts: lockInfo.failedAttempts,
              });
            } else if (result.error === "Account not verified") {
              throw new LoginError(
                "Your alumni account has not been verified. Contact the administrator.",
                {
                  email: loginFormData.email,
                  errorType: "account_not_verified",
                }
              );
            } else if (result.error === "Invalid credentials") {
              // Refresh account lock status after failed login
              const lockInfo = await checkAccountLockStatus(
                loginFormData.email
              );
              setAccountLockInfo(lockInfo);

              const attemptsLeft = lockInfo.maxAttempts
                ? lockInfo.maxAttempts - (lockInfo.failedAttempts || 0)
                : null;
              const warningMessage =
                attemptsLeft && attemptsLeft <= 2
                  ? ` Warning: ${attemptsLeft} attempt${
                      attemptsLeft === 1 ? "" : "s"
                    } remaining before account lockout.`
                  : "";

              throw new LoginError(
                `Invalid login credentials. Please try again.${warningMessage}`,
                {
                  email: loginFormData.email,
                  errorType: "invalid_credentials",
                  failedAttempts: lockInfo.failedAttempts,
                }
              );
            } else {
              throw new LoginError(
                result.error ||
                  "Login failed. Please check your credentials and try again.",
                {
                  email: loginFormData.email,
                  errorType: "generic_error",
                }
              );
            }
          } else if (result?.ok) {
            // Clear any existing lock info on successful login
            setAccountLockInfo({ isLocked: false });
            setLockdownCountdown(0);

            // Check if user is properly authenticated
            const session = await getSession();
            if (session) {
              router.push("/dashboard");
            } else {
              throw new LoginError(
                "Session creation failed. Please try again."
              );
            }
          } else {
            throw new LoginError("Login failed. Please try again.");
          }
        }
      );
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof LoginError) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
        Sentry.captureException(error, {
          tags: {
            component: "LoginPage",
          },
          extra: {
            email: loginFormData.email,
          },
        });
      }
    } finally {
      setIsLoading(false);
      refreshCaptcha();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSessionModalConfirm = async () => {
    setIsSessionModalLoading(true);
    try {
      // Terminate other sessions
      await fetch("/api/auth/terminate-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: sessionModalData.userId }),
      });

      // Close modal and proceed with login
      setShowSessionModal(false);
      setIsSessionModalLoading(false);

      // Now proceed with the actual login
      const result = await signIn("credentials", {
        ...loginFormData,
        captchaExpected: captcha?.hash,
        captchaExpiresAt: captcha?.expiresAt,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        setSuccessMessage("Login successful! Redirecting...");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error terminating sessions:", error);
      setError("Failed to terminate other sessions. Please try again.");
    } finally {
      setIsSessionModalLoading(false);
    }
  };

  const handleSessionModalCancel = () => {
    setShowSessionModal(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
      <Card className="w-full max-w-xl mx-auto shadow-2xl">
        <CardHeader className="space-y-2 text-center ">
          <div
            className={`rounded-full w-16 h-16 mx-auto flex items-center justify-center  ${
              accountLockInfo.isLocked
                ? "bg-red-100 dark:bg-red-900/20 animate-pulse"
                : "bg-primary/10 dark:bg-primary/20 animate-pulse"
            }`}
          >
            {accountLockInfo.isLocked ? (
              <Ban className="h-8 w-8 text-red-500" />
            ) : (
              <Lock className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {accountLockInfo.isLocked ? "Account Locked" : "Secure Login"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {accountLockInfo.isLocked
              ? "Your account is temporarily locked due to multiple failed login attempts"
              : "Access your College Management System"}
          </CardDescription>
        </CardHeader>
        {/* Account Lock Warning */}
        {accountLockInfo.isLocked && (
          <Alert variant="destructive" className="mx-6 mb-4 w-auto">
            <Ban className="h-4 w-4" />
            <AlertTitle>Account Temporarily Locked</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Your account has been locked due to{" "}
                {accountLockInfo.failedAttempts || "multiple"} failed login
                attempts.
              </p>
              {lockdownCountdown > 0 && (
                <div className="flex items-center space-x-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-mono">
                    Unlock in: {formatTime(lockdownCountdown)}
                  </span>
                </div>
              )}
              <p className="text-xs mt-2">
                For security reasons, please wait for the cooldown period to
                complete before attempting to log in again.
              </p>
            </AlertDescription>
          </Alert>
        )}
        {/* Regular alerts */}
        {(error || successMessage) && !accountLockInfo.isLocked && (
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
        {/* Show error even when account is locked */}
        {error && accountLockInfo.isLocked && (
          <Alert variant="destructive" className="mx-6 mb-4 w-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}{" "}
        {/* Security Status Indicator - Only shown when there are actual failed attempts */}
        {accountLockInfo.failedAttempts !== undefined &&
          accountLockInfo.failedAttempts > 0 &&
          !accountLockInfo.isLocked &&
          accountLockInfo.maxAttempts &&
          accountLockInfo.maxAttempts > accountLockInfo.failedAttempts && (
            <Alert
              variant="default"
              className="mx-6 mb-4 border-yellow-200 w-auto bg-yellow-50 dark:bg-yellow-900/20"
            >
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                Security Notice
              </AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                {accountLockInfo.failedAttempts} failed login attempt
                {accountLockInfo.failedAttempts > 1 ? "s" : ""} detected.
                <span className="font-medium">
                  {" "}
                  (
                  {accountLockInfo.maxAttempts -
                    accountLockInfo.failedAttempts}{" "}
                  attempt
                  {accountLockInfo.maxAttempts -
                    accountLockInfo.failedAttempts !==
                  1
                    ? "s"
                    : ""}{" "}
                  remaining)
                </span>
              </AlertDescription>
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
                  disabled={accountLockInfo.isLocked}
                  className="focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={loginFormData.password}
                    onChange={handleLoginInputChange}
                    required
                    placeholder="••••••••"
                    disabled={accountLockInfo.isLocked}
                    className="focus:ring-2 focus:ring-primary/50 transition-all duration-300 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    disabled={accountLockInfo.isLocked}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
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
                    disabled={accountLockInfo.isLocked}
                    className="focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSendOtp}
                    disabled={
                      !loginFormData.email ||
                      isOtpLoading ||
                      otpResendCountdown > 0 ||
                      accountLockInfo.isLocked
                    }
                    className="flex items-center space-x-1 whitespace-nowrap"
                  >
                    {isOtpLoading ? (
                      <ClipLoader
                        size={16}
                        color="currentColor"
                        className="mr-1"
                      />
                    ) : otpResendCountdown > 0 ? (
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
                  disabled={accountLockInfo.isLocked}
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsForgotPasswordModalOpen(true)}
                disabled={accountLockInfo.isLocked}
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
                      Security Check:
                    </p>
                    <p className="text-2xl font-bold">
                      {captcha?.question || "Loading..."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={refreshCaptcha}
                    disabled={accountLockInfo.isLocked}
                    className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="captchaAnswer"
                  name="captchaAnswer"
                  type="text"
                  value={loginFormData.captchaAnswer}
                  onChange={handleLoginInputChange}
                  required
                  placeholder="Enter your answer"
                  disabled={accountLockInfo.isLocked}
                  className="bg-primary-foreground dark:text-white focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
                <input
                  type="hidden"
                  name="captchaHash"
                  value={captcha?.hash || ""}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || isOtpLoading || accountLockInfo.isLocked}
            >
              {accountLockInfo.isLocked ? (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Account Locked
                </>
              ) : isLoading ? (
                <>
                  <ClipLoader size={20} color="currentColor" className="mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/50 flex items-center justify-center space-x-2 py-4 rounded-b-lg">
          {accountLockInfo.isLocked ? (
            <>
              <Ban className="h-5 w-5 text-red-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Account temporarily locked
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Secure login protected
              </span>
            </>
          )}
        </CardFooter>
      </Card>

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onOpenChange={setIsForgotPasswordModalOpen}
      />

      <SessionLogoutModal
        isOpen={showSessionModal}
        onClose={handleSessionModalCancel}
        onConfirm={handleSessionModalConfirm}
        userEmail={sessionModalData.userEmail}
        lastActivity={sessionModalData.lastActivity}
        isLoading={isSessionModalLoading}
      />
    </div>
  );
}
