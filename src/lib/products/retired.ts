export const RETIRED_PRODUCT_SLUGS = ["pet-insurance"] as const;

export function isRetiredProductSlug(slug: string): boolean {
  return (RETIRED_PRODUCT_SLUGS as readonly string[]).includes(slug);
}

export function withoutRetiredProducts<T extends { slug: string }>(products: T[]): T[] {
  return products.filter((p) => !isRetiredProductSlug(p.slug));
}
