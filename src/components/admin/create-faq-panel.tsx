"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateFaqPanelProps {
  onCreated?: () => void;
}

export function CreateFaqPanel({ onCreated }: CreateFaqPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        answer,
        category: category || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive: true,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Failed to create FAQ");
      return;
    }

    setQuestion("");
    setAnswer("");
    setCategory("");
    setSortOrder("0");
    setOpen(false);
    onCreated?.();
  }

  if (!open) {
    return (
      <Button type="button" variant="accent" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add FAQ
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-semibold">New FAQ</h2>
      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="faq-question">Question</Label>
          <Input id="faq-question" value={question} onChange={(e) => setQuestion(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="faq-answer">Answer</Label>
          <Textarea id="faq-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required rows={5} className="mt-1.5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="faq-category">Category</Label>
            <Input id="faq-category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="faq-order">Sort order</Label>
            <Input id="faq-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="mt-1.5" />
          </div>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Create FAQ"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
