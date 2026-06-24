"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AiAdvisorPublicConfig, AiChatMessage } from "@/types/ai-advisor";
import { cn } from "@/lib/utils";

const SESSION_KEY = "shiv_ai_session";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const QUICK_PROMPTS = [
  "What insurance do I need for my car?",
  "Estimate premium for motor insurance",
  "How do I file a claim?",
  "Compare your health products",
];

export function AiAdvisorChat() {
  const [config, setConfig] = useState<AiAdvisorPublicConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [sessionId, setSessionId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(getSessionId());
    fetch("/api/ai-advisor/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setConfig(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const loadHistory = useCallback(async (convId: string, sessId: string) => {
    const res = await fetch(
      `/api/ai-advisor/chat?conversationId=${encodeURIComponent(convId)}&sessionId=${encodeURIComponent(sessId)}`
    );
    const data = await res.json();
    if (data.success && data.data.messages?.length) {
      setMessages(data.data.messages);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("shiv_ai_conversation");
    if (stored && sessionId) {
      setConversationId(stored);
      void loadHistory(stored, sessionId);
    }
  }, [sessionId, loadHistory]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !sessionId) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationId,
          sessionId,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error ?? "Something went wrong. Please try again." },
        ]);
        return;
      }

      if (data.data.conversationId) {
        setConversationId(data.data.conversationId);
        localStorage.setItem("shiv_ai_conversation", data.data.conversationId);
      }

      setMessages((prev) => [...prev, data.data.message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to reach the advisor. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!config?.enabled || !config.showOnPublicSite) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
          aria-label="Open AI insurance advisor"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[min(560px,calc(100vh-3rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          <header className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <p className="font-semibold">{config.assistantName}</p>
              <p className="text-xs opacity-90">Powered by Shiv Insurance</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{config.welcomeMessage}</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={msg.id ?? i}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
          >
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, premiums, claims…"
                rows={2}
                className="min-h-0 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
