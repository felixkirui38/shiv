"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/blog", label: "Posts" },
  { href: "/admin/blog/categories", label: "Categories" },
  { href: "/admin/blog/comments", label: "Comments" },
];

export default function AdminBlogCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#1e40af",
    sortOrder: 0,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/blog-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setForm({ name: "", description: "", color: "#1e40af", sortOrder: 0 });
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <AdminPageHeader
        title="Blog categories"
        description="Organize articles by topic."
        action={
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="size-4" /> Add category
          </Button>
        }
      />

      <nav className="mb-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              t.href === "/admin/blog/categories"
                ? "border-b-2 border-primary text-primary"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 max-w-lg space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input id="color" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="mt-1 h-10" />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="mt-1" />
            </div>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create category"}</Button>
        </form>
      )}

      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/blog-categories"
        columns={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "postCount", label: "Posts" },
          { key: "sortOrder", label: "Order" },
          { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
        ]}
        emptyMessage="No categories yet."
      />
    </div>
  );
}
