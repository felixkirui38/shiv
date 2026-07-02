import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { StaticCmsPage, getStaticPageMeta } from "@/components/public/static-cms-page";
import { getPublicCmsPage } from "@/lib/cms/public-content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublicCmsPage("terms");
  const fallback = getStaticPageMeta("terms");
  return buildPageMetadata("/terms", {
    title: page?.metaTitle ?? page?.title ?? fallback.title,
    description: page?.metaDescription ?? fallback.description,
  });
}

export default function TermsPage() {
  return <StaticCmsPage slug="terms" />;
}
