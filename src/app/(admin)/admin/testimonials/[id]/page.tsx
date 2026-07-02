"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminTestimonialEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState("5");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/testimonials/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setName(d.data.name);
          setRole(d.data.role ?? "");
          setCompany(d.data.company ?? "");
          setContent(d.data.content);
          setRating(String(d.data.rating ?? 5));
          setIsActive(d.data.isActive);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        role: role || undefined,
        company: company || undefined,
        content,
        rating: Number(rating) || 5,
        isActive,
      }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Testimonial saved." : data.error ?? "Save failed");
  }

  async function handleDelete() {
    if (!confirm("Delete this testimonial?")) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/testimonials");
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
        title="Edit testimonial"
        description="Update customer review displayed on the website."
        action={<Link href="/admin/testimonials"><Button variant="outline">Back</Button></Link>}
      />
      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="rating">Rating</Label>
            <Input id="rating" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="content">Testimonial</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={6} className="mt-1.5" />
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
