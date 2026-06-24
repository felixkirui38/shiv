import { prisma } from "@/lib/prisma";
import { defaultHomepageContent } from "@/config/homepage.defaults";
import { getPublishedWebsiteConfig } from "@/lib/cms/website-builder";
import { mergeCatalogIntoHomepage } from "@/lib/products/catalog";
import type { HomepageContent } from "@/types/homepage";

const HOMEPAGE_SETTING_KEY = "homepage_content";

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const published = await getPublishedWebsiteConfig();
    return published.homepage;
  } catch {
    // fall through
  }

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: HOMEPAGE_SETTING_KEY },
    });
    if (setting?.value) {
      const stored = setting.value as unknown as HomepageContent;
      return {
        ...defaultHomepageContent,
        ...stored,
        hero: { ...defaultHomepageContent.hero, ...stored.hero },
        products: { ...defaultHomepageContent.products, ...stored.products },
      };
    }
  } catch {
    // Database unavailable
  }

  return defaultHomepageContent;
}

export async function getWebsiteLayout() {
  return getPublishedWebsiteConfig();
}

export async function saveHomepageContent(
  content: HomepageContent
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: HOMEPAGE_SETTING_KEY },
    update: { value: content as object, group: "homepage" },
    create: {
      key: HOMEPAGE_SETTING_KEY,
      value: content as object,
      group: "homepage",
    },
  });
}
