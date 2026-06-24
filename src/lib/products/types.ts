import type { Prisma } from "@/generated/prisma/client";

export const productDetailInclude = {
  bannerImage: true,
  heroImage: true,
  ogImage: true,
  benefits: { orderBy: { sortOrder: "asc" as const } },
  coverages: { orderBy: { sortOrder: "asc" as const } },
  exclusions: { orderBy: { sortOrder: "asc" as const } },
  eligibilityItems: { orderBy: { sortOrder: "asc" as const } },
  requiredDocuments: { orderBy: { sortOrder: "asc" as const } },
  faqs: { orderBy: { sortOrder: "asc" as const } },
  premiumRules: {
    where: { isActive: true },
    orderBy: { priority: "desc" as const },
  },
} satisfies Prisma.InsuranceProductInclude;

export const productListInclude = {
  bannerImage: true,
  heroImage: true,
  _count: { select: { benefits: true, coverages: true } },
} satisfies Prisma.InsuranceProductInclude;

export type ProductWithDetails = Prisma.InsuranceProductGetPayload<{
  include: typeof productDetailInclude;
}>;

export type ProductListItem = Prisma.InsuranceProductGetPayload<{
  include: typeof productListInclude;
}>;

export function serializeProduct(product: ProductWithDetails) {
  return {
    ...product,
    basePremium: Number(product.basePremium),
    coverages: product.coverages.map((c) => ({
      ...c,
      limit: c.limit ? Number(c.limit) : null,
      deductible: c.deductible ? Number(c.deductible) : null,
    })),
    premiumRules: product.premiumRules.map((r) => ({
      ...r,
      multiplier: Number(r.multiplier),
      fixedAmount: Number(r.fixedAmount),
    })),
  };
}

export function serializeProductListItem(product: ProductListItem) {
  return {
    ...product,
    basePremium: Number(product.basePremium),
  };
}
