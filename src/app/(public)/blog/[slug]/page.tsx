import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/blog/queries";
import {
  buildPageMetadata,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  getSeoGlobal,
  resolveCanonical,
} from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { BlogCommentForm } from "@/components/public/blog-comment-form";
import { JsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  return buildPageMetadata(`/blog/${slug}`, {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    keywords: post.metaKeywords?.split(",").map((k) => k.trim()),
    image: post.featuredImageUrl ?? undefined,
    type: "article",
    publishedTime: post.publishedAt ?? undefined,
    modifiedTime: post.updatedAt,
    author: post.authorName ?? undefined,
    section: post.category?.name,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, true);
  if (!post) notFound();

  const global = await getSeoGlobal();
  const url = resolveCanonical(`/blog/${slug}`, global);

  const articleLd = buildArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    url,
    image: post.featuredImageUrl,
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt,
    authorName: post.authorName,
    organization: global.organization,
  });

  const breadcrumbLd = buildBreadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${slug}` },
    ],
    global.siteUrl
  );

  return (
    <article className="bg-white">
      <JsonLd data={[articleLd, breadcrumbLd]} />

      {post.featuredImageUrl && (
        <div className="relative aspect-[21/9] w-full bg-slate-100">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1 text-sm text-secondary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to blog
        </Link>

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {post.category && (
              <Badge variant="outline" className="border-brand text-primary">
                {post.category.name}
              </Badge>
            )}
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="secondary" className="text-xs">#{tag}</Badge>
              </Link>
            ))}
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight text-primary md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-body">
            {post.authorName && (
              <span className="flex items-center gap-1">
                <User className="size-4" /> {post.authorName}
              </span>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          {post.excerpt && (
            <p className="mt-4 text-lg text-body">{post.excerpt}</p>
          )}
        </header>

        <div
          className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-secondary [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.comments.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-10">
            <h2 className="mb-6 font-heading text-xl font-semibold">
              Comments ({post.comments.length})
            </h2>
            <div className="space-y-4">
              {post.comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-slate-50 p-4">
                  <p className="font-medium text-slate-800">{c.authorName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{c.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <BlogCommentForm slug={slug} />
        </div>
      </div>
    </article>
  );
}
