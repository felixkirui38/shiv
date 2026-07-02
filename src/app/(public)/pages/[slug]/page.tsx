import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicCmsPage } from "@/lib/cms/public-content";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicCmsPage(slug);
  if (!page) return { title: "Page not found" };

  return buildPageMetadata(`/pages/${slug}`, {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
  });
}

export default async function CmsPublicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublicCmsPage(slug);
  if (!page) notFound();

  return (
    <article className="bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-secondary hover:underline"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>
        <h1 className="mb-8 font-heading text-3xl font-bold text-primary md:text-4xl">
          {page.title}
        </h1>
        <div
          className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-secondary"
          dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
        />
      </div>
    </article>
  );
}
