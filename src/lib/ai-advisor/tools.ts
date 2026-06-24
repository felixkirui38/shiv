import { prisma } from "@/lib/prisma";
import { getActiveProducts, getProductBySlug } from "@/lib/products/queries";
import { CLAIM_STATUS_LABELS } from "@/lib/claims/types";
import { calculateProductPremium } from "@/lib/products/calculator";

export async function buildProductCatalogContext() {
  const products = await getActiveProducts();
  return products.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    description: p.shortDescription,
    basePremiumKes: p.basePremium,
    href: `/products/${p.slug}`,
    buyHref: `/products/${p.slug}/buy`,
  }));
}

export async function buildCustomerContext(userId: string) {
  const [policies, claims, quotes, user] = await Promise.all([
    prisma.policy.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, slug: true } } },
    }),
    prisma.claim.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        claimNumber: true,
        status: true,
        claimAmount: true,
        createdAt: true,
      },
    }),
    prisma.quote.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true } } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    }),
  ]);

  return {
    customerName:
      `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email,
    policies: policies.map((p) => ({
      policyNumber: p.policyNumber,
      product: p.product.name,
      productSlug: p.product.slug,
      status: p.status,
      premium: Number(p.premium),
      renewalDate: p.renewalDate?.toISOString().slice(0, 10),
    })),
    claims: claims.map((c) => ({
      claimNumber: c.claimNumber,
      status: CLAIM_STATUS_LABELS[c.status],
      amount: Number(c.claimAmount),
    })),
    recentQuotes: quotes.map((q) => ({
      quoteNumber: q.quoteNumber,
      product: q.product.name,
      premium: Number(q.estimatedPremium),
      status: q.status,
    })),
  };
}

export async function toolSuggestProducts(args: {
  needs?: string;
  category?: string;
  limit?: number;
}) {
  const products = await getActiveProducts();
  const limit = args.limit ?? 5;
  let filtered = products;

  if (args.category) {
    const cat = args.category.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.category?.toLowerCase().includes(cat) ||
        p.name.toLowerCase().includes(cat) ||
        p.slug.includes(cat)
    );
  }

  if (args.needs) {
    const terms = args.needs.toLowerCase().split(/\s+/);
    filtered = filtered.filter((p) => {
      const text = `${p.name} ${p.shortDescription} ${p.category}`.toLowerCase();
      return terms.some((t) => text.includes(t));
    });
  }

  if (filtered.length === 0) filtered = products;

  return filtered.slice(0, limit).map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.shortDescription,
    startingPremiumKes: p.basePremium,
    purchaseUrl: `/products/${p.slug}/buy`,
    detailsUrl: `/products/${p.slug}`,
  }));
}

export async function toolEstimatePremium(args: {
  productSlug: string;
  coverageAmount?: number;
}) {
  const product = await getProductBySlug(args.productSlug);
  if (!product) return { error: "Product not found" };

  const coverageAmount = args.coverageAmount ?? 100000;

  try {
    const result = await calculateProductPremium(args.productSlug, {
      productType: product.category ?? product.slug,
      coverageAmount,
      factors: {},
    });

    return {
      product: product.name,
      slug: product.slug,
      estimatedAnnualPremiumKes: result.totalPremium,
      monthlyPremiumKes: result.monthlyPremium,
      breakdown: result.adjustments,
      disclaimer:
        "This is an indicative estimate. Final premium may vary after underwriting.",
    };
  } catch {
    return {
      product: product.name,
      slug: product.slug,
      estimatedAnnualPremiumKes: product.basePremium,
      disclaimer:
        "Indicative starting premium from base rate. Complete the online application for an exact premium.",
    };
  }
}

export async function toolRecommendCoverage(args: { productSlug: string; profile?: string }) {
  const product = await getProductBySlug(args.productSlug);
  if (!product) return { error: "Product not found" };

  return {
    product: product.name,
    slug: product.slug,
    profile: args.profile,
    coverages: product.coverages.map((c) => ({
      name: c.name,
      description: c.description,
      limit: c.limit,
      deductible: c.deductible,
      included: c.isIncluded,
    })),
    benefits: product.benefits.map((b) => ({
      title: b.title,
      description: b.description,
    })),
    eligibility: product.eligibilityItems.map((e) => e.title),
  };
}

export function toolExplainClaims(args?: { topic?: string }) {
  const steps = [
    {
      step: 1,
      title: "Report the incident",
      description: "Notify Shiv Insurance as soon as possible via portal, phone, or email.",
    },
    {
      step: 2,
      title: "Submit documentation",
      description: "Upload police abstracts, photos, medical reports, or other required documents.",
    },
    {
      step: 3,
      title: "Assessment",
      description: "Our claims team reviews your submission and may request additional information.",
    },
    {
      step: 4,
      title: "Decision & payment",
      description: "Approved claims are settled per your policy terms.",
    },
  ];

  return {
    topic: args?.topic ?? "general",
    process: steps,
    portalUrl: "/portal/claims/new",
    trackUrl: "/portal/claims",
    infoUrl: "/claims",
    statuses: CLAIM_STATUS_LABELS,
  };
}

export async function toolComparePolicies(args: { slugs: string[] }) {
  const slugs = args.slugs.slice(0, 3);
  const products = await Promise.all(slugs.map((s) => getProductBySlug(s)));

  return products
    .filter(Boolean)
    .map((p) => {
      if (!p) return null;
      return {
        name: p.name,
        slug: p.slug,
        category: p.category,
        basePremiumKes: p.basePremium,
        description: p.shortDescription,
        coverageCount: p.coverages.length,
        topCoverages: p.coverages.slice(0, 5).map((c) => c.name),
        benefits: p.benefits.slice(0, 3).map((b) => b.title),
      };
    })
    .filter(Boolean);
}
