import type { HomepageContent } from "@/types/homepage";
import type { getActiveProducts } from "@/lib/products/queries";

type CatalogItem = Awaited<ReturnType<typeof getActiveProducts>>[number];

export function mergeCatalogIntoHomepage(
  content: HomepageContent,
  catalog: CatalogItem[]
): HomepageContent {
  if (!catalog.length) return content;

  return {
    ...content,
    products: {
      title: content.products.title,
      subtitle: content.products.subtitle,
      cards: catalog.map((p, i) => ({
        id: p.id,
        label: p.name,
        slug: p.slug,
        description: p.shortDescription ?? "",
        icon: p.icon ?? "shield",
        enabled: true,
        sortOrder: p.sortOrder ?? i,
      })),
    },
    insuranceFinder: {
      ...content.insuranceFinder,
      options: content.insuranceFinder.options.map((option) => {
        const match =
          catalog.find((p) => p.category === option.id) ??
          catalog.find((p) => p.slug.includes(option.id));
        return match ? { ...option, productSlug: match.slug } : option;
      }),
    },
  };
}
