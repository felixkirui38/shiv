"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { BlogRichEditor } from "@/components/admin/blog-rich-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface BlogPostFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string | null;
  authorId: string | null;
  featuredImageId: string | null;
  featuredImageUrl?: string | null;
  tags: string[];
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  scheduledAt: string;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

const emptyForm: BlogPostFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  categoryId: null,
  authorId: null,
  featuredImageId: null,
  tags: [],
  status: "DRAFT",
  scheduledAt: "",
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

interface Option {
  id: string;
  name: string;
}

export function BlogPostForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: BlogPostFormData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostFormData>(initial ?? emptyForm);
  const [categories, setCategories] = useState<Option[]>([]);
  const [authors, setAuthors] = useState<Option[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"content" | "seo" | "settings">("content");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/blog-categories").then((r) => r.json()),
      fetch("/api/admin/blog-meta?type=authors").then((r) => r.json()),
    ]).then(([catRes, authorRes]) => {
      if (catRes.success) {
        setCategories(
          (catRes.data.items as { id: string; name: string }[]).map((c) => ({
            id: c.id,
            name: c.name,
          }))
        );
      }
      if (authorRes.success) {
        setAuthors(authorRes.data as Option[]);
      }
    });
  }, []);

  function update<K extends keyof BlogPostFormData>(key: K, value: BlogPostFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    update("tags", [...form.tags, t]);
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      scheduledAt: form.scheduledAt || null,
      categoryId: form.categoryId || null,
      authorId: form.authorId || null,
      featuredImageId: form.featuredImageId || null,
    };

    const url =
      mode === "edit" && form.id
        ? `/api/admin/blog-posts/${form.id}`
        : "/api/admin/blog-posts";
    const method = mode === "edit" ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!data.success) {
      setError(data.error ?? "Save failed");
      return;
    }

    if (mode === "create") {
      router.push(`/admin/blog/${data.data.id}/edit`);
    } else {
      router.refresh();
    }
  }

  const tabs = [
    { id: "content" as const, label: "Content" },
    { id: "seo" as const, label: "SEO" },
    { id: "settings" as const, label: "Publish" },
  ];

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="auto-generated from title"
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Content</Label>
            <BlogRichEditor
              value={form.content}
              onChange={(html) => update("content", html)}
              className="mt-1"
            />
          </div>
          <MediaPicker
            value={form.featuredImageId}
            imageUrl={form.featuredImageUrl}
            onChange={(id, url) => {
              update("featuredImageId", id);
              update("featuredImageUrl", url ?? null);
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.categoryId ?? ""}
                onChange={(e) => update("categoryId", e.target.value || null)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <select
                id="author"
                value={form.authorId ?? ""}
                onChange={(e) => update("authorId", e.target.value || null)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Default (you)</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {form.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs"
                >
                  {t}
                  <button type="button" onClick={() => update("tags", form.tags.filter((x) => x !== t))}>×</button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag"
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
          </div>
        </div>
      )}

      {tab === "seo" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input
              id="metaTitle"
              value={form.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta description</Label>
            <Textarea
              id="metaDescription"
              value={form.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="metaKeywords">Meta keywords</Label>
            <Input
              id="metaKeywords"
              value={form.metaKeywords}
              onChange={(e) => update("metaKeywords", e.target.value)}
              placeholder="comma-separated"
              className="mt-1"
            />
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => update("status", e.target.value as BlogPostFormData["status"])}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          {form.status === "SCHEDULED" && (
            <div>
              <Label htmlFor="scheduledAt">Schedule for</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => update("scheduledAt", e.target.value)}
                className="mt-1"
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => update("isFeatured", e.target.checked)}
            />
            Feature on homepage
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {mode === "create" ? "Create post" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
