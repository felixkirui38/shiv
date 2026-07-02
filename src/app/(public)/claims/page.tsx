import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { StaticCmsPage, getStaticPageMeta } from "@/components/public/static-cms-page";
import { getPublicCmsPage } from "@/lib/cms/public-content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublicCmsPage("claims");
  const fallback = getStaticPageMeta("claims");
  return buildPageMetadata("/claims", {
    title: page?.metaTitle ?? page?.title ?? fallback.title,
    description: page?.metaDescription ?? fallback.description,
  });
}

export default function ClaimsPage() {
  return <StaticCmsPage slug="claims" />;
}
