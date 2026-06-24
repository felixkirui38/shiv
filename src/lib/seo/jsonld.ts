import type { SeoGlobalSettings, SeoOrganization, BreadcrumbItem } from "@/types/seo";
import { getSeoGlobal, getSiteUrl } from "./store";

export function buildOrganizationJsonLd(org: SeoOrganization) {
  return {
    "@type": "InsuranceAgency",
    name: org.name,
    legalName: org.legalName,
    url: org.url,
    logo: org.logo,
    telephone: org.telephone,
    email: org.email,
    ...(org.address
      ? {
          address: {
            "@type": "PostalAddress",
            ...org.address,
          },
        }
      : {}),
    sameAs: org.sameAs,
  };
}

export async function buildWebsiteJsonLd() {
  const global = await getSeoGlobal();
  const siteUrl = global.siteUrl.replace(/\/$/, "");

  return {
    "@type": "WebSite",
    name: global.siteName,
    url: siteUrl,
    publisher: {
      "@type": "InsuranceAgency",
      name: global.organization.name,
      logo: global.organization.logo,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], baseUrl?: string) {
  const base = (baseUrl ?? getSiteUrl()).replace(/\/$/, "");

  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${base}${item.path}`,
    })),
  };
}

export function buildArticleJsonLd(input: {
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  authorName?: string | null;
  organization?: SeoOrganization;
}) {
  const org = input.organization;

  return {
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.image ? [input.image] : undefined,
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt ?? input.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : org
        ? { "@type": "Organization", name: org.name }
        : undefined,
    publisher: org
      ? {
          "@type": "Organization",
          name: org.name,
          logo: { "@type": "ImageObject", url: org.logo },
        }
      : undefined,
  };
}

export function buildInsuranceProductJsonLd(input: {
  name: string;
  slug: string;
  description?: string | null;
  longDescription?: string | null;
  basePremium: number;
  category?: string | null;
  faqs?: { question: string; answer: string }[];
  organization?: SeoOrganization;
}) {
  const baseUrl = getSiteUrl().replace(/\/$/, "");
  const url = `${baseUrl}/products/${input.slug}`;
  const org = input.organization;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "FinancialProduct",
      name: input.name,
      description: input.description ?? input.longDescription,
      url,
      category: input.category ?? "Insurance",
      provider: org
        ? {
            "@type": "InsuranceAgency",
            name: org.name,
            url: org.url,
            logo: org.logo,
            telephone: org.telephone,
          }
        : undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: "KES",
        price: input.basePremium,
        availability: "https://schema.org/InStock",
        url,
        seller: org
          ? { "@type": "InsuranceAgency", name: org.name }
          : undefined,
      },
    },
    buildBreadcrumbJsonLd(
      [
        { name: "Home", path: "/" },
        { name: "Insurance Products", path: "/products" },
        { name: input.name, path: `/products/${input.slug}` },
      ],
      baseUrl
    ),
  ];

  if (input.faqs && input.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: input.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function mergeJsonLd(...schemas: Record<string, unknown>[]) {
  const graphs: Record<string, unknown>[] = [];

  for (const schema of schemas) {
    if (schema["@graph"] && Array.isArray(schema["@graph"])) {
      graphs.push(...(schema["@graph"] as Record<string, unknown>[]));
    } else {
      const { "@context": _, ...rest } = schema;
      graphs.push(rest);
    }
  }

  return {
    "@context": "https://schema.org",
    "@graph": graphs,
  };
}
