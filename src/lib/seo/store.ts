import { prisma } from "@/lib/prisma";
import { defaultSeoSettings } from "@/config/seo.defaults";
import type { SeoCmsData, SeoGlobalSettings, SeoPageOverrides } from "@/types/seo";

const SEO_GLOBAL_KEY = "seo_global";
const SEO_PAGES_KEY = "seo_pages";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
}

export function getSiteName() {
  return process.env.NEXT_PUBLIC_APP_NAME ?? "Shiv Insurance Brokers";
}

export async function getSeoGlobal(): Promise<SeoGlobalSettings> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: SEO_GLOBAL_KEY },
    });
    if (setting?.value) {
      const stored = setting.value as Partial<SeoGlobalSettings>;
      return {
        ...defaultSeoSettings.global,
        ...stored,
        robots: { ...defaultSeoSettings.global.robots, ...stored.robots },
        sitemap: { ...defaultSeoSettings.global.sitemap, ...stored.sitemap },
        organization: { ...defaultSeoSettings.global.organization, ...stored.organization },
      };
    }
  } catch {
    // DB unavailable
  }
  return defaultSeoSettings.global;
}

export async function getSeoPageOverrides(): Promise<SeoPageOverrides> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: SEO_PAGES_KEY },
    });
    if (setting?.value) {
      return { ...defaultSeoSettings.pages, ...(setting.value as SeoPageOverrides) };
    }
  } catch {
    // DB unavailable
  }
  return defaultSeoSettings.pages;
}

export async function getSeoCmsData(): Promise<SeoCmsData> {
  const [global, pages] = await Promise.all([getSeoGlobal(), getSeoPageOverrides()]);
  return { global, pages };
}

export async function saveSeoGlobal(global: SeoGlobalSettings): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: SEO_GLOBAL_KEY },
    update: { value: global as object, group: "seo" },
    create: { key: SEO_GLOBAL_KEY, value: global as object, group: "seo" },
  });
}

export async function saveSeoPages(pages: SeoPageOverrides): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: SEO_PAGES_KEY },
    update: { value: pages as object, group: "seo" },
    create: { key: SEO_PAGES_KEY, value: pages as object, group: "seo" },
  });
}

export async function saveSeoCmsData(data: SeoCmsData): Promise<void> {
  await Promise.all([saveSeoGlobal(data.global), saveSeoPages(data.pages)]);
}

export function resolveCanonical(path: string, global: SeoGlobalSettings, override?: string) {
  if (override) return override;
  const base = global.siteUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized === "/" ? "" : normalized}`;
}

export function formatTitle(title: string, global: SeoGlobalSettings) {
  if (title.includes("|")) return title;
  return global.titleTemplate.replace("%s", title);
}
