import { z } from "zod";

const organizationSchema = z.object({
  name: z.string().min(1),
  legalName: z.string().optional(),
  url: z.string().url(),
  logo: z.string().url(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  address: z
    .object({
      streetAddress: z.string().optional(),
      addressLocality: z.string().optional(),
      addressRegion: z.string().optional(),
      postalCode: z.string().optional(),
      addressCountry: z.string().optional(),
    })
    .optional(),
  sameAs: z.array(z.string().url()).optional(),
});

export const seoGlobalSchema = z.object({
  siteName: z.string().min(1),
  siteUrl: z.string().url(),
  titleTemplate: z.string().min(1),
  defaultTitle: z.string().min(1),
  defaultDescription: z.string().min(1),
  defaultKeywords: z.array(z.string()).default([]),
  defaultOgImage: z.string().url(),
  twitterHandle: z.string().optional(),
  twitterCard: z.enum(["summary", "summary_large_image"]).default("summary_large_image"),
  ogLocale: z.string().default("en_KE"),
  robots: z.object({
    index: z.boolean(),
    follow: z.boolean(),
    noArchive: z.boolean().optional(),
    noSnippet: z.boolean().optional(),
    googleBot: z.string().optional(),
  }),
  sitemap: z.object({
    enabled: z.boolean(),
    includeBlog: z.boolean(),
    includeProducts: z.boolean(),
    changefreq: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]),
    excludePaths: z.array(z.string()),
  }),
  organization: organizationSchema,
});

export const seoPageOverrideSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonical: z.string().url().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional(),
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
});

export const seoCmsSchema = z.object({
  global: seoGlobalSchema,
  pages: z.record(z.string(), seoPageOverrideSchema),
});
