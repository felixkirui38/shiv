"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminStatisticEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [suffix, setSuffix] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/statistics/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLabel(d.data.label);
          setValue(d.data.value);
          setSuffix(d.data.suffix ?? "");
          setIcon(d.data.icon ?? "");
          setSortOrder(String(d.data.sortOrder ?? 0));
          setIsActive(d.data.isActive);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/statistics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        value,
        suffix: suffix || undefined,
        icon: icon || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Statistic saved." : data.error ?? "Save failed");
  }

  async function handleDelete() {
    if (!confirm("Delete this statistic?")) return;
    const res = await fetch(`/api/admin/statistics/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/statistics");
    else setMessage(data.error ?? "Delete failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title="Edit statistic"
        description="Update homepage counter values."
        action={<Link href="/admin/statistics"><Button variant="outline">Back</Button></Link>}
      />
      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} required className="mt-1.5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="value">Value</Label>
            <Input id="value" value={value} onChange={(e) => setValue(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="suffix">Suffix</Label>
            <Input id="suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="+" className="mt-1.5" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="icon">Icon key (optional)</Label>
            <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input id="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active on website
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          <Button type="button" variant="destructive" className="gap-2" onClick={handleDelete}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </form>
    </div>
  );
}
