"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FollowUpChatProps {
  evaluationId: string | null;
}

export function FollowUpChat({ evaluationId }: FollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || !evaluationId || sending) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);

    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluation_id: evaluationId, user_question: question }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Failed to get a response.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.system_response as string },
      ]);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSending(false);
    }
  }

  const locked = !evaluationId;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Follow-up Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {locked && (
          <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Complete an evaluation above to unlock follow-up questions.
          </p>
        )}

        {/* Message thread */}
        {messages.length > 0 && (
          <>
            <div
              className="flex max-h-[360px] flex-col gap-3 overflow-y-auto rounded-md border border-border p-3"
              aria-live="polite"
              aria-label="Chat thread"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.role === "user"
                      ? "ml-auto max-w-[75%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "mr-auto max-w-[75%] rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
                  }
                >
                  {msg.content}
                </div>
              ))}
              {sending && (
                <div className="mr-auto max-w-[75%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Thinking…
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <Separator />
          </>
        )}

        {/* Error */}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Input row */}
        <div className="flex gap-2">
          <Textarea
            placeholder={
              locked
                ? "Evaluate an offer first…"
                : "Ask anything about this offer…"
            }
            className="min-h-[60px] flex-1 resize-none text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={locked || sending}
          />
          <Button
            className="self-end"
            onClick={sendMessage}
            disabled={locked || sending || !input.trim()}
          >
            {sending ? "…" : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
