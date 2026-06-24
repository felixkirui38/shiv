import { prisma } from "@/lib/prisma";
import { defaultSiteNavigation } from "@/config/navigation.defaults";
import { getPublishedWebsiteConfig } from "@/lib/cms/website-builder";
import type { SiteNavigationConfig } from "@/types/navigation";
import { getActiveProducts } from "@/lib/products/queries";

const NAV_SETTING_KEY = "site_navigation";

function mergeProductsIntoNav(
  config: SiteNavigationConfig,
  products: Awaited<ReturnType<typeof getActiveProducts>>
): SiteNavigationConfig {
  if (!products.length) return config;

  const productLinks = products.map((p) => ({
    label: p.name,
    href: `/products/${p.slug}`,
    description: p.shortDescription ?? undefined,
    icon: p.icon ?? "shield",
  }));

  const columns = config.footer.columns.map((col) =>
    col.title === "Insurance Products" ? { ...col, links: productLinks } : col
  );

  return {
    ...config,
    header: { ...config.header, products: productLinks },
    footer: { ...config.footer, columns },
  };
}

export async function getSiteNavigation(): Promise<SiteNavigationConfig> {
  let config = defaultSiteNavigation;

  try {
    const published = await getPublishedWebsiteConfig();
    config = published.navigation;
  } catch {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: NAV_SETTING_KEY },
      });

      if (setting?.value) {
        const stored = setting.value as unknown as SiteNavigationConfig;
        config = {
          ...defaultSiteNavigation,
          ...stored,
          notification: { ...defaultSiteNavigation.notification, ...stored.notification },
          header: { ...defaultSiteNavigation.header, ...stored.header },
          actions: { ...defaultSiteNavigation.actions, ...stored.actions },
          footer: {
            ...defaultSiteNavigation.footer,
            ...stored.footer,
            columns: stored.footer?.columns ?? defaultSiteNavigation.footer.columns,
            social: stored.footer?.social ?? defaultSiteNavigation.footer.social,
            newsletter: {
              ...defaultSiteNavigation.footer.newsletter,
              ...stored.footer?.newsletter,
            },
          },
        };
      }
    } catch {
      // use defaults
    }
  }

  try {
    const products = await getActiveProducts();
    return mergeProductsIntoNav(config, products);
  } catch {
    return config;
  }
}

export async function saveSiteNavigation(
  config: SiteNavigationConfig
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: NAV_SETTING_KEY },
    update: { value: config as object, group: "navigation" },
    create: {
      key: NAV_SETTING_KEY,
      value: config as object,
      group: "navigation",
    },
  });
}
