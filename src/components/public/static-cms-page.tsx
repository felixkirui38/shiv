import { getPublicCmsPage } from "@/lib/cms/public-content";
import { staticPageDefaults } from "@/lib/cms/static-page-defaults";

interface StaticCmsPageProps {
  slug: string;
  className?: string;
}

export async function StaticCmsPage({ slug, className }: StaticCmsPageProps) {
  const fallback = staticPageDefaults[slug];
  const page = await getPublicCmsPage(slug);

  const title = page?.title ?? fallback?.title ?? slug;
  const content = page?.content ?? fallback?.content ?? "<p>Content coming soon.</p>";

  return (
    <div className={className ?? "container mx-auto max-w-3xl px-4 py-16"}>
      <h1 className="mb-6 font-heading text-4xl font-bold text-primary">{title}</h1>
      <div
        className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-secondary"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export function getStaticPageMeta(slug: string) {
  const fallback = staticPageDefaults[slug];
  return {
    title: fallback?.title,
    description: fallback?.description,
  };
}
