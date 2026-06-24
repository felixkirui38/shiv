import type { Metadata } from "next";
import type { AutoSeoInput } from "@/types/seo";
import {
  formatTitle,
  getSeoGlobal,
  getSeoPageOverrides,
  resolveCanonical,
} from "./store";

export async function buildPageMetadata(
  path: string,
  auto: AutoSeoInput = {}
): Promise<Metadata> {
  const [global, pages] = await Promise.all([getSeoGlobal(), getSeoPageOverrides()]);
  const override = pages[path] ?? {};

  const rawTitle = override.title ?? auto.title ?? global.defaultTitle;
  const title = formatTitle(rawTitle, global);
  const description =
    override.description ?? auto.description ?? global.defaultDescription;
  const keywords = override.keywords ?? auto.keywords ?? global.defaultKeywords;
  const image = override.ogImage ?? auto.image ?? global.defaultOgImage;
  const canonical = resolveCanonical(path, global, override.canonical ?? auto.canonical);
  const ogTitle = override.ogTitle ?? rawTitle;
  const ogDescription = override.ogDescription ?? description;

  const noIndex = override.noIndex ?? auto.noIndex ?? false;
  const noFollow = override.noFollow ?? auto.noFollow ?? false;

  const robots = {
    index: !noIndex && global.robots.index,
    follow: !noFollow && global.robots.follow,
    ...(global.robots.googleBot ? { googleBot: global.robots.googleBot } : {}),
    ...(noIndex || noFollow
      ? {
          index: !noIndex,
          follow: !noFollow,
        }
      : {}),
  };

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(global.siteUrl),
    alternates: { canonical },
    robots,
    openGraph: {
      type: auto.type ?? "website",
      locale: global.ogLocale,
      url: canonical,
      siteName: global.siteName,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: image, alt: ogTitle }],
      ...(auto.type === "article" && auto.publishedTime
        ? {
            publishedTime: auto.publishedTime,
            modifiedTime: auto.modifiedTime,
            authors: auto.author ? [auto.author] : undefined,
            section: auto.section,
          }
        : {}),
    },
    twitter: {
      card: global.twitterCard,
      site: global.twitterHandle,
      creator: global.twitterHandle,
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
  };
}

export async function buildRootMetadata(): Promise<Metadata> {
  return buildPageMetadata("/");
}
