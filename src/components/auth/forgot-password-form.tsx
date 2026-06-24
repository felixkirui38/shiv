"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) setMessage(data.data.message);
    else setMessage(data.error ?? "Request failed");
  }

  return (
    <div className="mt-6 border-t pt-4">
      <p className="mb-2 text-sm font-medium">Forgot password?</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={loading}>
          {loading ? "…" : "Reset"}
        </Button>
      </form>
      {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
    </div>
  );
}
