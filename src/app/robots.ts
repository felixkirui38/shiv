import type { MetadataRoute } from "next";
import { generateRobotsConfig } from "@/lib/seo/sitemap";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return generateRobotsConfig();
}
