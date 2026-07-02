"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateStatisticPanelProps {
  onCreated?: () => void;
}

export function CreateStatisticPanel({ onCreated }: CreateStatisticPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [suffix, setSuffix] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/statistics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        value,
        suffix: suffix || undefined,
        isActive: true,
        sortOrder: 0,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Failed to create statistic");
      return;
    }

    setLabel("");
    setValue("");
    setSuffix("");
    setOpen(false);
    onCreated?.();
  }

  if (!open) {
    return (
      <Button type="button" variant="accent" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add statistic
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-semibold">New statistic</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="s-label">Label</Label>
          <Input id="s-label" value={label} onChange={(e) => setLabel(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="s-value">Value</Label>
          <Input id="s-value" value={value} onChange={(e) => setValue(e.target.value)} required placeholder="25" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="s-suffix">Suffix</Label>
          <Input id="s-suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="+" className="mt-1.5" />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Create statistic"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
