"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
  }, [isPending, session, router]);

  if (isPending) return <div className="p-6">Loading…</div>;
  if (!session) return null;

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Signed in as {session.user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
          <Button className="bg-slate-700 text-white hover:bg-slate-600 hover:cursor-pointer"
            onClick={() => {
            router.push("/chat");
            }}>Education Advisor</Button>
          <Button className="bg-red-700 text-white hover:bg-red-600 hover:cursor-pointer"
            onClick={async () => {
            // Sign out the user and redirect to login page
            await signOut();
            router.push("/login");
            }}>Sign out</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
