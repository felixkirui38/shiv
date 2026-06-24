"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NewsletterConfig } from "@/types/navigation";

export function NewsletterForm({ config }: { config: NewsletterConfig }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("idle");
    }
  }

  if (!config.enabled) return null;

  return (
    <div>
      <h4 className="mb-2 font-heading text-sm font-semibold tracking-wide text-accent uppercase">
        {config.title}
      </h4>
      <p className="mb-4 text-sm text-white/75">{config.description}</p>
      {status === "success" ? (
        <p className="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          Thank you for subscribing.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
          />
          <Button
            type="submit"
            variant="accent"
            disabled={status === "loading"}
            className="shrink-0"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </Button>
        </form>
      )}
    </div>
  );
}
