// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { forgetPassword } from "@/lib/auth-client";
import Link from "next/link";
import { MESSAGES } from "@/constants/lang/messages";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const result = await forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        const raw = (result.error.message || "").toLowerCase();
        const msg = raw
          ? MESSAGES.forgotPassword.sendFailed
          : MESSAGES.forgotPassword.genericError;
        setError(msg);
      } else {
        setSuccess(true);
        console.log(MESSAGES.forgotPassword.emailSent, email);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(MESSAGES.forgotPassword.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  {MESSAGES.forgotPassword.emailSentAlert}
                </AlertDescription>
              </Alert>
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent"
              >
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? MESSAGES.forgotPassword.sending : MESSAGES.forgotPassword.sendReset}
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent"
              >
                <Link href="/login">Back to Login</Link>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}