import type { Metadata } from "next";
import type { getProductBySlug } from "@/lib/products/queries";
import { buildPageMetadata, buildInsuranceProductJsonLd, getSeoGlobal } from "@/lib/seo";

type SerializedProduct = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function buildProductMetadata(
  product: Pick<
    SerializedProduct,
    "name" | "slug" | "shortDescription" | "metaTitle" | "metaDescription" | "ogImage" | "bannerImage" | "heroImage" | "category"
  >
): Promise<Metadata> {
  const image =
    product.ogImage?.url ??
    product.bannerImage?.url ??
    product.heroImage?.url ??
    undefined;

  return buildPageMetadata(`/products/${product.slug}`, {
    title: product.metaTitle ?? product.name,
    description:
      product.metaDescription ??
      product.shortDescription ??
      `${product.name} insurance from Shiv Insurance Brokers`,
    image,
    type: "website",
  });
}

export async function buildProductJsonLd(
  product: Pick<
    SerializedProduct,
    "name" | "slug" | "shortDescription" | "longDescription" | "basePremium" | "category" | "faqs"
  >
) {
  const global = await getSeoGlobal();

  return buildInsuranceProductJsonLd({
    name: product.name,
    slug: product.slug,
    description: product.shortDescription,
    longDescription: product.longDescription,
    basePremium: product.basePremium,
    category: product.category,
    faqs: product.faqs,
    organization: global.organization,
  });
}
