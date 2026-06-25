import { defaultProductsSeed } from "../../../prisma/seed-products";
import type { ProductListItem, ProductWithDetails } from "@/lib/products/types";

const STUB_DATE = new Date("2024-01-01T00:00:00.000Z");

function stubId(prefix: string, key: string) {
  return `fallback-${prefix}-${key}`;
}

function buildFallbackProduct(
  data: (typeof defaultProductsSeed)[number]
) {
  const productId = stubId("product", data.slug);

  const benefits = (data.benefits ?? []).map((item, index) => ({
    id: stubId("benefit", `${data.slug}-${index}`),
    productId,
    title: item.title,
    description: item.description ?? null,
    icon: null,
    sortOrder: item.sortOrder ?? index,
  }));

  const coverages = (data.coverages ?? []).map((item, index) => ({
    id: stubId("coverage", `${data.slug}-${index}`),
    productId,
    name: item.name,
    description: item.description ?? null,
    limit: item.limit ?? null,
    deductible: item.deductible ?? null,
    isIncluded: item.isIncluded ?? true,
    sortOrder: item.sortOrder ?? index,
  }));

  const exclusions = (data.exclusions ?? []).map((item, index) => ({
    id: stubId("exclusion", `${data.slug}-${index}`),
    productId,
    title: item.title,
    description: item.description ?? null,
    sortOrder: item.sortOrder ?? index,
  }));

  const eligibilityItems = (data.eligibilityItems ?? []).map((item, index) => ({
    id: stubId("eligibility", `${data.slug}-${index}`),
    productId,
    title: item.title,
    description: item.description ?? null,
    sortOrder: item.sortOrder ?? index,
  }));

  const requiredDocuments = (data.requiredDocuments ?? []).map((item, index) => ({
    id: stubId("document", `${data.slug}-${index}`),
    productId,
    name: item.name,
    description: item.description ?? null,
    isRequired: item.isRequired ?? true,
    sortOrder: item.sortOrder ?? index,
  }));

  const faqs = (data.faqs ?? []).map((item, index) => ({
    id: stubId("faq", `${data.slug}-${index}`),
    productId,
    question: item.question,
    answer: item.answer,
    sortOrder: item.sortOrder ?? index,
  }));

  const premiumRules = (data.premiumRules ?? []).map((item, index) => ({
    id: stubId("rule", `${data.slug}-${index}`),
    productId,
    name: item.name,
    fieldKey: item.fieldKey,
    operator: item.operator,
    value: item.value,
    multiplier: item.multiplier ?? 1,
    fixedAmount: item.fixedAmount ?? 0,
    priority: item.priority ?? 0,
    isActive: true,
    createdAt: STUB_DATE,
    updatedAt: STUB_DATE,
  }));

  return {
    id: productId,
    slug: data.slug,
    name: data.name,
    category: data.category ?? null,
    shortDescription: data.shortDescription ?? null,
    longDescription: data.longDescription ?? null,
    icon: data.icon ?? null,
    bannerImageId: null,
    heroImageId: null,
    ogImageId: null,
    basePremium: Number(data.basePremium ?? 0),
    pricingFormula: data.pricingFormula ?? null,
    claimProcedure: data.claimProcedure ?? null,
    terms: data.terms ?? null,
    isActive: true,
    sortOrder: data.sortOrder ?? 0,
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    createdAt: STUB_DATE,
    updatedAt: STUB_DATE,
    bannerImage: null,
    heroImage: null,
    ogImage: null,
    benefits,
    coverages: coverages.map((c) => ({
      ...c,
      limit: c.limit ? Number(c.limit) : null,
      deductible: c.deductible ? Number(c.deductible) : null,
    })),
    exclusions,
    eligibilityItems,
    requiredDocuments,
    faqs,
    premiumRules,
  };
}

export function getFallbackActiveProducts(): ProductListItem[] {
  return defaultProductsSeed.map((data) => {
    const product = buildFallbackProduct(data);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      icon: product.icon,
      bannerImageId: null,
      heroImageId: null,
      ogImageId: null,
      basePremium: product.basePremium,
      pricingFormula: product.pricingFormula,
      claimProcedure: product.claimProcedure,
      terms: product.terms,
      isActive: true,
      sortOrder: product.sortOrder,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      bannerImage: null,
      heroImage: null,
      _count: {
        benefits: product.benefits.length,
        coverages: product.coverages.length,
      },
    };
  });
}

export function getFallbackProductBySlug(slug: string): ProductWithDetails | null {
  const data = defaultProductsSeed.find((p) => p.slug === slug);
  if (!data) return null;
  return buildFallbackProduct(data) as unknown as ProductWithDetails;
}

export function getFallbackProductSlugs(): string[] {
  return defaultProductsSeed.map((p) => p.slug);
}
