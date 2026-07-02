import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import {
  getFallbackActiveProducts,
  getFallbackProductBySlug,
  getFallbackProductSlugs,
} from "@/lib/products/fallback";
import {
  productDetailInclude,
  productListInclude,
  serializeProduct,
  serializeProductListItem,
} from "@/lib/products/types";
import { isRetiredProductSlug, RETIRED_PRODUCT_SLUGS, withoutRetiredProducts } from "@/lib/products/retired";

export async function getActiveProducts() {
  try {
    const products = await withDbRetry(() =>
      prisma.insuranceProduct.findMany({
        where: {
          isActive: true,
          slug: { notIn: [...RETIRED_PRODUCT_SLUGS] },
        },
        orderBy: { sortOrder: "asc" },
        include: productListInclude,
      })
    );
    if (products.length === 0) return withoutRetiredProducts(getFallbackActiveProducts());
    return products.map(serializeProductListItem);
  } catch {
    return withoutRetiredProducts(getFallbackActiveProducts());
  }
}

export async function getAllProducts() {
  try {
    const products = await prisma.insuranceProduct.findMany({
      orderBy: { sortOrder: "asc" },
      include: productListInclude,
    });
    return products.map(serializeProductListItem);
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  if (isRetiredProductSlug(slug)) return null;

  try {
    const product = await withDbRetry(() =>
      prisma.insuranceProduct.findUnique({
        where: { slug, isActive: true },
        include: productDetailInclude,
      })
    );
    if (product) return serializeProduct(product);
  } catch {
    // use static fallback below
  }

  const fallback = getFallbackProductBySlug(slug);
  return fallback ? serializeProduct(fallback) : null;
}

export async function getProductBySlugAdmin(slug: string) {
  try {
    const product = await prisma.insuranceProduct.findUnique({
      where: { slug },
      include: productDetailInclude,
    });
    return product ? serializeProduct(product) : null;
  } catch {
    return null;
  }
}

export async function getProductSlugs() {
  try {
    const products = await withDbRetry(() =>
      prisma.insuranceProduct.findMany({
        where: {
          isActive: true,
          slug: { notIn: [...RETIRED_PRODUCT_SLUGS] },
        },
        select: { slug: true },
      })
    );
    if (products.length === 0) {
      return withoutRetiredProducts(
        getFallbackProductSlugs().map((slug) => ({ slug }))
      ).map((p) => p.slug);
    }
    return products.map((p) => p.slug);
  } catch {
    return withoutRetiredProducts(
      getFallbackProductSlugs().map((slug) => ({ slug }))
    ).map((p) => p.slug);
  }
}
