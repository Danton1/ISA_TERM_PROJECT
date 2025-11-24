// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MESSAGES } from "@/constants/lang/messages";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
  }, [isPending, session, router]);

  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();

        if (!data.user || data.user.role !== "admin") {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        setIsAdmin(false);
        console.log(err);
      }
    }

    checkRole();
  }, []);

  useEffect(() => {
    async function loadUsage() {
      try {
        const res = await fetch("/api/total-usage");
        const data = await res.json();
        setUsage(data.total_usage);
      } catch {
        setUsage(null);
      }
    }

    if (session?.user) loadUsage();
  }, [session]);

  if (isPending) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 rounded-full border-4 border-gray-200 border-t-slate-700 animate-spin"
            role="status"
            aria-label="loading"
          />
          <span>{MESSAGES.general.loading}</span>
        </div>
      </div>
    );
  }
  if (!session) return null;

  const usageNumber = typeof usage === "number" ? usage : 0;
  const apiUsageColor =
    usageNumber < 15 ? "text-slate-500" : usageNumber < 20 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Signed in as {session.user.email}
            <br />
            <span className={`text-sm ${apiUsageColor}`}>
              {MESSAGES.dashboard.totalApiRequests} {usage ?? "–"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              className="bg-slate-700 text-white hover:bg-slate-600 hover:cursor-pointer"
              onClick={() => {
                router.push("/chat");
              }}
            >
              Education Advisor
            </Button>
            {isAdmin ? (
              <Button
                className="bg-green-700 text-white hover:bg-green-600 hover:cursor-pointer"
                onClick={() => {
                  router.push("/admin");
                }}
              >
                Admin Panel
              </Button>
            ) : null}
            <Button
              className="bg-red-700 text-white hover:bg-red-600 hover:cursor-pointer"
              onClick={async () => {
                // Sign out the user and redirect to login page
                await signOut();
                router.push("/login");
              }}
            >
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
