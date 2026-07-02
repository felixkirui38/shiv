"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateTestimonialPanelProps {
  onCreated?: () => void;
}

export function CreateTestimonialPanel({ onCreated }: CreateTestimonialPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState("5");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        role: role || undefined,
        company: company || undefined,
        content,
        rating: Number(rating) || 5,
        isActive: true,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Failed to create testimonial");
      return;
    }

    setName("");
    setRole("");
    setCompany("");
    setContent("");
    setRating("5");
    setOpen(false);
    onCreated?.();
  }

  if (!open) {
    return (
      <Button type="button" variant="accent" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add testimonial
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-semibold">New testimonial</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="t-name">Name</Label>
          <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="t-role">Role</Label>
          <Input id="t-role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="t-company">Company</Label>
          <Input id="t-company" value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="t-rating">Rating (1–5)</Label>
          <Input id="t-rating" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1.5" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="t-content">Testimonial</Label>
          <Textarea id="t-content" value={content} onChange={(e) => setContent(e.target.value)} required rows={4} className="mt-1.5" />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Create testimonial"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
