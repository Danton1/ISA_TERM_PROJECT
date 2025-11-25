// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { resetPassword } from "@/lib/auth-client";
import { MESSAGES } from "@/constants/lang/messages";

type Props = { token: string };

export default function ResetPasswordClient({ token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(MESSAGES.auth.missingResetToken);
      return;
    }
    if (password !== confirmPassword) {
      setError(MESSAGES.auth.passwordsDontMatch);
      return;
    }
    if (password.length < 8) {
      setError(MESSAGES.auth.passwordTooShort);
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        const raw = (result.error.message || "").toLowerCase();
        const msg = raw
          ? MESSAGES.resetPassword.failed
          : MESSAGES.resetPassword.genericError;
        setError(msg);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      console.error(MESSAGES.resetPassword.resetError, err);
      setError(MESSAGES.resetPassword.genericError);
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 rounded-full border-4 border-gray-200 border-t-slate-700 animate-spin"
            role="status"
            aria-label="loading"
          />
          <span className="text-xl text-slate-800">{MESSAGES.general.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center text-green-600">
              {MESSAGES.resetPassword.success}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!token}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!token}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? MESSAGES.resetPassword.resetting : MESSAGES.resetPassword.resetPassword}
            </Button>

            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/login">Back to Login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
