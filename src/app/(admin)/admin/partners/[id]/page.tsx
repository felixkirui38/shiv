"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaPicker } from "@/components/admin/media-picker";

export default function AdminPartnerEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/partners/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setName(d.data.name);
          setWebsite(d.data.website ?? "");
          setLogoId(d.data.logoId ?? null);
          setLogoUrl(d.data.logoUrl ?? null);
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
    const res = await fetch(`/api/admin/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        website: website || "",
        logoId,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage("Partner saved.");
      setLogoUrl(data.data.logoUrl ?? null);
    } else {
      setMessage(data.error ?? "Save failed");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this partner?")) return;
    const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/partners");
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
        title="Edit partner"
        description="Update partner details and logo."
        action={<Link href="/admin/partners"><Button variant="outline">Back</Button></Link>}
      />
      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <MediaPicker
          label="Logo"
          value={logoId}
          imageUrl={logoUrl}
          onChange={(mediaId, url) => {
            setLogoId(mediaId);
            setLogoUrl(url ?? null);
          }}
        />
        <div>
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input id="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="mt-1.5" />
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
