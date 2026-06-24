import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User } from "lucide-react";
import { listPublishedPosts, listCategories } from "@/lib/blog/queries";
import { buildPageMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlogListingFilters } from "@/components/public/blog-listing-filters";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/blog", {
    title: "Insurance Blog",
    description: "Latest insurance articles, tips, and expert advice from Shiv Insurance Brokers.",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; tag?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const { items, pagination } = await listPublishedPosts({
    page,
    limit: 12,
    categorySlug: params.category,
    tag: params.tag,
    search: params.search,
  });
  const categories = await listCategories();

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl font-bold text-primary md:text-4xl">Insurance Blog</h1>
          <p className="mt-2 max-w-2xl text-body">
            Expert insights, guides, and news to help you make informed insurance decisions.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Suspense fallback={<div className="mb-8 h-10" />}>
          <BlogListingFilters
            categories={categories.filter((c) => c.isActive).map((c) => ({ slug: c.slug, name: c.name }))}
            currentCategory={params.category}
            currentSearch={params.search}
          />
        </Suspense>

        {items.length === 0 ? (
          <p className="py-16 text-center text-slate-500">No articles found. Check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full overflow-hidden border-brand bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  {post.featuredImageUrl ? (
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={post.featuredImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-1.5 bg-secondary" />
                  )}
                  <CardHeader>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      {post.category && (
                        <Badge variant="outline" className="border-brand text-xs text-primary">
                          {post.category.name}
                        </Badge>
                      )}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1 text-xs text-body">
                          <Calendar className="size-3" />
                          {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <CardTitle className="font-heading text-lg leading-snug">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.authorName && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="size-3" /> {post.authorName}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog?${new URLSearchParams({
                  ...(params.category ? { category: params.category } : {}),
                  ...(params.search ? { search: params.search } : {}),
                  page: String(p),
                })}`}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  p === page ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
