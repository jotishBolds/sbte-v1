"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

export default function SessionResetPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any existing session data
    localStorage.clear();
    sessionStorage.clear();

    // Clear any cookies by setting them to expire
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  }, []);

  const handleReturnToLogin = () => {
    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6" />
            Session Reset
          </CardTitle>
          <CardDescription>
            Your session has been reset due to security reasons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            This might happen due to:
            <ul className="mt-2 list-disc list-inside text-left">
              <li>Session timeout</li>
              <li>Multiple login attempts from different devices</li>
              <li>Security policy enforcement</li>
            </ul>
          </div>
          <Button onClick={handleReturnToLogin} className="w-full">
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
