"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function BlogCommentForm({ slug }: { slug: string }) {
  const [form, setForm] = useState({ authorName: "", authorEmail: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const res = await fetch(`/api/blog/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!data.success) {
      setError(data.error ?? "Failed to submit comment");
      return;
    }

    setMessage(data.data.message);
    setForm({ authorName: "", authorEmail: "", content: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-heading text-lg font-semibold">Leave a comment</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="authorName">Name</Label>
          <Input
            id="authorName"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="authorEmail">Email</Label>
          <Input
            id="authorEmail"
            type="email"
            value={form.authorEmail}
            onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
            required
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="content">Comment</Label>
        <Textarea
          id="content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={4}
          required
          className="mt-1"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}
      <Button type="submit" disabled={saving} className="gap-2">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit comment
      </Button>
    </form>
  );
}
