import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { STATIC_SEO_PAGES } from "@/config/seo.defaults";
import { getSeoGlobal } from "./store";

export async function generateSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const global = await getSeoGlobal();

  if (!global.sitemap.enabled) return [];

  const base = global.siteUrl.replace(/\/$/, "");
  const now = new Date();
  const changefreq = global.sitemap.changefreq;

  const isExcluded = (path: string) =>
    global.sitemap.excludePaths.some(
      (ex) => path === ex || path.startsWith(`${ex}/`)
    );

  const entries: MetadataRoute.Sitemap = [];

  for (const page of STATIC_SEO_PAGES) {
    if (!isExcluded(page.path)) {
      entries.push({
        url: `${base}${page.path === "/" ? "" : page.path}`,
        lastModified: now,
        changeFrequency: changefreq,
        priority: page.path === "/" ? 1 : 0.8,
      });
    }
  }

  if (global.sitemap.includeProducts) {
    try {
      const products = await prisma.insuranceProduct.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      });
      for (const p of products) {
        const path = `/products/${p.slug}`;
        if (!isExcluded(path)) {
          entries.push({
            url: `${base}${path}`,
            lastModified: p.updatedAt,
            changeFrequency: "weekly",
            priority: 0.9,
          });
        }
      }
    } catch {
      // DB unavailable
    }
  }

  if (global.sitemap.includeBlog) {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          OR: [
            { status: "PUBLISHED" },
            { status: "SCHEDULED", scheduledAt: { lte: now } },
          ],
        },
        select: { slug: true, updatedAt: true, publishedAt: true },
      });
      for (const post of posts) {
        const path = `/blog/${post.slug}`;
        if (!isExcluded(path)) {
          entries.push({
            url: `${base}${path}`,
            lastModified: post.updatedAt,
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
    } catch {
      // DB unavailable
    }
  }

  return entries;
}

export async function generateRobotsConfig(): Promise<MetadataRoute.Robots> {
  const global = await getSeoGlobal();
  const base = global.siteUrl.replace(/\/$/, "");

  const disallow = [
    "/admin/",
    "/portal/",
    "/api/",
    "/login",
    "/register",
    ...global.sitemap.excludePaths.filter((p) => p !== "/"),
  ];

  return {
    rules: {
      userAgent: "*",
      allow: global.robots.index ? "/" : undefined,
      disallow: global.robots.index ? disallow : ["/"],
    },
    sitemap: global.sitemap.enabled ? `${base}/sitemap.xml` : undefined,
    host: base,
  };
}
