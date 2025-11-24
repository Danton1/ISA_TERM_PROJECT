"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MESSAGES } from "@/constants/lang/messages";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await signIn.email({ email, password });
    if (error) {
      if (error.message === MESSAGES.auth.invalidCredentials) {
        setError(MESSAGES.auth.invalidCredentials);
      } else {
        setError(MESSAGES.auth.signInFailed);
      }
    };
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Welcome back</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            {error &&  
              <p className="text-red-500 text-center">
                {error === MESSAGES.auth.invalidCredentials ? MESSAGES.auth.invalidCredentials : error}
              </p>
            }
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="mt-4 text-sm flex justify-between">
            <Link href="/signup" className="underline">Create account</Link>
            <Link href="/forgot-password" className="underline">Forgot password?</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
