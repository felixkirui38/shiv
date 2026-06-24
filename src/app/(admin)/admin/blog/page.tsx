"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/blog", label: "Posts" },
  { href: "/admin/blog/categories", label: "Categories" },
  { href: "/admin/blog/comments", label: "Comments" },
];

export default function AdminBlogPage() {
  const router = useRouter();

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description="Create and publish insurance articles, manage categories and comments."
        action={
          <Link href="/admin/blog/new" className={buttonVariants({ className: "gap-2" })}>
            New Post
          </Link>
        }
      />

      <nav className="mb-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              t.href === "/admin/blog"
                ? "border-b-2 border-primary text-primary"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <AdminDataTable
        apiPath="/api/admin/blog-posts"
        columns={[
          { key: "title", label: "Title" },
          { key: "categoryName", label: "Category" },
          {
            key: "status",
            label: "Status",
            render: (r) => {
              const s = r.status as string;
              return s === "PUBLISHED" ? "Published" : s === "SCHEDULED" ? "Scheduled" : s === "DRAFT" ? "Draft" : s;
            },
          },
          { key: "isFeatured", label: "Featured", render: (r) => (r.isFeatured ? "Yes" : "—") },
          { key: "viewCount", label: "Views" },
          {
            key: "publishedAt",
            label: "Date",
            render: (r) =>
              r.publishedAt
                ? new Date(r.publishedAt as string).toLocaleDateString()
                : r.scheduledAt
                  ? `Scheduled ${new Date(r.scheduledAt as string).toLocaleDateString()}`
                  : "—",
          },
        ]}
        statusOptions={[
          { value: "DRAFT", label: "Draft" },
          { value: "SCHEDULED", label: "Scheduled" },
          { value: "PUBLISHED", label: "Published" },
          { value: "ARCHIVED", label: "Archived" },
        ]}
        onRowClick={(row) => router.push(`/admin/blog/${row.id}/edit`)}
        bulkDelete
        exportFilename="blog-posts"
      />
    </div>
  );
}
