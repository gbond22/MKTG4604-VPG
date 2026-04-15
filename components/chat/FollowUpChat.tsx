"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Minimal markdown → HTML converter for assistant responses.
 * Only processes patterns produced by template-responder.ts.
 * Safe: content is server-generated, never user-reflected.
 * Only called after streaming is complete — never on partial text.
 */
function markdownToHtml(text: string): string {
  return (
    text
      // Tables (keep as preformatted so columns align)
      .replace(
        /((?:\|.+\|\n?){2,})/g,
        (t) => `<pre class="my-1 overflow-x-auto rounded bg-muted/60 p-2 text-xs">${t.trimEnd()}</pre>`
      )
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic _text_
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Unordered list items starting with "- "
      .replace(
        /^- (.+)$/gm,
        '<li class="ml-4 list-disc leading-relaxed">$1</li>'
      )
      // Wrap runs of <li> elements in <ul>
      .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="my-1">${m}</ul>`)
      // Paragraph breaks
      .replace(/\n\n/g, "<br /><br />")
      // Single newlines
      .replace(/\n/g, "<br />")
  );
}

const TYPING_DELAY_MS = 2000;
const WORD_INTERVAL_MS = 30;

interface Message {
  role: "user" | "assistant";
  content: string;
  typing?: true;    // bouncing dots phase
  streaming?: true; // word-reveal phase — content is full text, rendered word by word
}

interface FollowUpChatProps {
  evaluationId: string | null;
}

export function FollowUpChat({ evaluationId }: FollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedCount, setStreamedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Holds the word array for whichever message is currently streaming
  const streamWordsRef = useRef<string[]>([]);

  // Smooth scroll when a new message bubble appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fast scroll to follow text growth during streaming
  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [streamedCount, isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  function startStreaming(fullText: string) {
    const words = fullText.split(" ");
    streamWordsRef.current = words;
    setStreamedCount(0);
    setIsStreaming(true);

    streamIntervalRef.current = setInterval(() => {
      setStreamedCount((prev) => {
        const next = prev + 1;
        if (next >= words.length) {
          clearInterval(streamIntervalRef.current!);
          streamIntervalRef.current = null;
          // Remove streaming flag — triggers markdown render
          setMessages((msgs) =>
            msgs.map((m) => (m.streaming ? { ...m, streaming: undefined } : m))
          );
          setIsStreaming(false);
        }
        return next;
      });
    }, WORD_INTERVAL_MS);
  }

  async function sendMessage() {
    const question = input.trim();
    if (!question || !evaluationId || sending || isStreaming) return;

    // Abort any in-progress stream before starting a new turn
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    setInput("");
    setError(null);
    setSending(true);

    setMessages((prev) => [
      // Finalise any message still marked streaming (edge case: user clicks send fast)
      ...prev.map((m) => (m.streaming ? { ...m, streaming: undefined } : m)),
      { role: "user", content: question },
      { role: "assistant", content: "", typing: true },
    ]);

    try {
      // API call and visual delay run concurrently; we wait for both
      const [res] = await Promise.all([
        fetch("/api/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ evaluation_id: evaluationId, user_question: question }),
        }),
        new Promise<void>((resolve) => setTimeout(resolve, TYPING_DELAY_MS)),
      ]);

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => !m.typing));
        setError(data?.error ?? "Failed to get a response.");
        return;
      }

      const fullText = data.system_response as string;

      // Swap typing bubble → streaming bubble (full content stored, revealed word by word)
      setMessages((prev) =>
        prev.map((m) =>
          m.typing
            ? { role: "assistant" as const, content: fullText, streaming: true }
            : m
        )
      );

      startStreaming(fullText);
    } catch {
      setMessages((prev) => prev.filter((m) => !m.typing));
      setError("Network error — please try again.");
    } finally {
      setSending(false);
    }
  }

  const locked = !evaluationId;
  const inputDisabled = locked || sending || isStreaming;

  return (
    <Card className="rounded-2xl shadow-sm border-[#D4D0CA] bg-[#F5F0EB]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#1A1A2E]">Follow-up Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {locked && (
          <p className="rounded-lg border border-[#D4D0CA] bg-[#EDE7DF]/50 px-4 py-3 text-sm text-[#999999]">
            Complete an evaluation above to unlock follow-up questions.
          </p>
        )}

        {/* Message thread */}
        {messages.length > 0 && (
          <>
            <div
              className="flex max-h-[360px] flex-col gap-3 overflow-y-auto rounded-md border border-[#D4D0CA] p-3"
              aria-live="polite"
              aria-label="Chat thread"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.role === "user"
                      ? "ml-auto max-w-[75%] rounded-lg bg-[#1B6B6D] px-3 py-2 text-sm text-white"
                      : "mr-auto max-w-[75%] rounded-lg border border-[#D4D0CA] bg-[#F5F0EB] px-3 py-2 text-sm text-[#2D2D3F]"
                  }
                >
                  {msg.typing ? (
                    /* ── Bouncing dots ── */
                    <span className="flex items-center gap-1 py-0.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999999] [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999999] [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999999] [animation-delay:300ms]" />
                    </span>
                  ) : msg.streaming ? (
                    /* ── Word-by-word reveal (raw text, no markdown yet) ── */
                    <span>
                      {streamWordsRef.current.slice(0, streamedCount + 1).join(" ")}
                      <span className="animate-pulse text-[#1B6B6D]">▍</span>
                    </span>
                  ) : msg.role === "assistant" ? (
                    /* ── Fully revealed — parse and render markdown ── */
                    <span
                      // Content is server-generated from fixed templates — safe.
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
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
            className="min-h-[60px] flex-1 resize-none text-sm bg-white border-[#D4D0CA] rounded-lg text-[#2D2D3F]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={inputDisabled}
          />
          <Button
            className="self-end hover:bg-[#155456]"
            onClick={sendMessage}
            disabled={inputDisabled || !input.trim()}
          >
            {sending ? "…" : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
