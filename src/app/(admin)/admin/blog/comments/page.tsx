"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Loader2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/blog", label: "Posts" },
  { href: "/admin/blog/categories", label: "Categories" },
  { href: "/admin/blog/comments", label: "Comments" },
];

interface CommentRow {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  postTitle: string;
  postSlug: string;
  createdAt: string;
}

export default function AdminBlogCommentsPage() {
  const [items, setItems] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("PENDING");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/blog-comments?${params}`);
    const data = await res.json();
    if (data.success) setItems(data.data.items);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function moderate(id: string, newStatus: string) {
    await fetch("/api/admin/blog-comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    load();
  }

  return (
    <div>
      <AdminPageHeader title="Blog comments" description="Moderate reader comments on published articles." />

      <nav className="mb-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              t.href === "/admin/blog/comments"
                ? "border-b-2 border-primary text-primary"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search comments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SPAM">Spam</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-slate-500">No comments found.</p>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{c.authorName}</p>
                  <p className="text-xs text-slate-500">{c.authorEmail}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{c.status}</span>
              </div>
              <p className="mb-2 text-sm text-slate-700">{c.content}</p>
              <p className="mb-3 text-xs text-slate-500">
                On{" "}
                <Link href={`/blog/${c.postSlug}`} className="text-primary hover:underline" target="_blank">
                  {c.postTitle}
                </Link>
                {" · "}
                {new Date(c.createdAt).toLocaleString()}
              </p>
              {c.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => moderate(c.id, "APPROVED")}>
                    <Check className="size-3" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => moderate(c.id, "REJECTED")}>
                    <X className="size-3" /> Reject
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moderate(c.id, "SPAM")}>Spam</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
