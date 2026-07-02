"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminCmsPageEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/cms/pages/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSlug(d.data.slug);
          setTitle(d.data.title);
          setContent(d.data.content ?? "");
          setMetaTitle(d.data.metaTitle ?? "");
          setMetaDescription(d.data.metaDescription ?? "");
          setIsPublished(d.data.isPublished);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/cms/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        content,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        isPublished,
      }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Page saved." : data.error ?? "Save failed");
  }

  async function handleDelete() {
    if (!confirm("Delete this page?")) return;
    const res = await fetch(`/api/admin/cms/pages/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/pages");
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
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Edit CMS page"
        description={`Slug: /${slug}`}
        action={
          <div className="flex gap-2">
            {isPublished && (
              <Button asChild variant="outline" className="gap-2">
                <a href={`/api/cms/pages/${slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" /> Preview API
                </a>
              </Button>
            )}
            <Link href="/admin/pages"><Button variant="outline">Back</Button></Link>
          </div>
        }
      />
      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="mt-1.5 font-mono text-sm" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta description</Label>
            <Input id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Published (visible via public CMS API)
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
