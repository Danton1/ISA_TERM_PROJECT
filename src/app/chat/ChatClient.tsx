"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hi! I’m your education advisor. Ask me anything—e.g., “What degree do I need to become a data scientist?”",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullWidth, setFullWidth] = useState(false); // small UX toggle
  const listRef = useRef<HTMLDivElement>(null);

  const send = async (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt || loading) return;

    setInput("");
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: prompt };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Request failed");

      const botMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: String(data?.response ?? "").trim() || "(no response)",
      };
      setMessages((m) => [...m, botMsg]);
    } catch (e: any) {
      const errMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Sorry—something went wrong talking to the advisor. Please try again.",
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // auto-scroll on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen bg-backgroundLight flex items-center justify-center p-4">
      <Card className={`w-full ${fullWidth ? "max-w-5xl" : "max-w-3xl"} shadow-lg`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Education Advisor</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullWidth((v) => !v)}
              className="hidden sm:inline-flex"
            >
              {fullWidth ? "Compact" : "Wide"}
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="grid gap-4">
            {/* Messages list */}
            <ScrollArea ref={listRef} className="h-[55vh] rounded-md border p-3 bg-card">
              <div className="space-y-4">
                {messages.map((m) => (
                  <MessageBubble key={m.id} role={m.role} content={m.content} />
                ))}
                {loading && <TypingRow />}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="rounded-md border p-2 bg-card">
              <Textarea
                placeholder="Ask about programs, degrees, admissions, or career paths…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="min-h-[72px] resize-none bg-background"
                disabled={loading}
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => setInput("")} disabled={loading || !input}>
                  Clear
                </Button>
                <Button onClick={() => send()} disabled={loading || !input}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2">
              {[
                "What degree do I need to become a data scientist?",
                "Which courses help me transition into ML engineering?",
                "What’s the difference between a BSc and a BASc?",
              ].map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  onClick={() => send(q)}
                  disabled={loading}
                  className="bg-background"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>EA</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {content}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function TypingRow() {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>EA</AvatarFallback>
      </Avatar>
      <div className="rounded-2xl bg-muted px-4 py-2 text-sm shadow-sm">
        <span className="inline-flex items-center gap-1">
          <span className="relative top-[1px]">Thinking</span>
          <span className="animate-pulse">.</span>
          <span className="animate-pulse [animation-delay:150ms]">.</span>
          <span className="animate-pulse [animation-delay:300ms]">.</span>
        </span>
      </div>
    </div>
  );
}
