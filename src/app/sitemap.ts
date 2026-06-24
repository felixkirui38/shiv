import type { MetadataRoute } from "next";
import { generateSitemapEntries } from "@/lib/seo/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return generateSitemapEntries();
}
