// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session)router.replace("/login");
  }, [isPending, session, router]);
  
  return (!isPending && !session) ? null : <ChatClient />;
}