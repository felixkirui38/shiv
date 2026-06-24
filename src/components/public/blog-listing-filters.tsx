"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

interface BlogListingFiltersProps {
  categories: { slug: string; name: string }[];
  currentCategory?: string;
  currentSearch?: string;
}

export function BlogListingFilters({
  categories,
  currentCategory,
  currentSearch,
}: BlogListingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/blog?${params}`);
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search articles…"
        defaultValue={currentSearch}
        className="max-w-xs"
        onKeyDown={(e) => {
          if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value);
        }}
      />
      <select
        value={currentCategory ?? ""}
        onChange={(e) => update("category", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
