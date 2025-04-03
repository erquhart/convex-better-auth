"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useState } from "react";
import { authClient } from "@/app/auth-client";
import EnableTwoFactor from "@/app/components/EnableTwoFactor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SecuritySettingsPage() {
  const [showEnable2FA, setShowEnable2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      await authClient.twoFactor.disable({
        password: "", // This will be handled by the backend
      });
      window.location.reload();
    } catch {
      alert("Failed to disable 2FA. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {showEnable2FA ? (
        <EnableTwoFactor />
      ) : (
        <div className="w-full max-w-md space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            asChild
          >
            <Link href="/">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </Button>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Security Settings
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account by requiring
                    a verification code in addition to your password.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowEnable2FA(true)}
                    disabled={loading}
                  >
                    Enable 2FA
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDisable2FA}
                    disabled={loading}
                  >
                    Disable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-center w-full border-t py-4">
                <p className="text-center text-xs text-neutral-500">
                  Powered by{" "}
                  <a
                    href="https://better-auth.com"
                    className="underline"
                    target="_blank"
                  >
                    <span className="dark:text-orange-200/90">
                      better-auth.
                    </span>
                  </a>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
