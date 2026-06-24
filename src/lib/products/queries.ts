import { prisma } from "@/lib/prisma";
import {
  productDetailInclude,
  productListInclude,
  serializeProduct,
  serializeProductListItem,
} from "@/lib/products/types";

export async function getActiveProducts() {
  try {
    const products = await prisma.insuranceProduct.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: productListInclude,
    });
    return products.map(serializeProductListItem);
  } catch {
    return [];
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
  try {
    const product = await prisma.insuranceProduct.findUnique({
      where: { slug, isActive: true },
      include: productDetailInclude,
    });
    return product ? serializeProduct(product) : null;
  } catch {
    return null;
  }
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
    const products = await prisma.insuranceProduct.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return products.map((p) => p.slug);
  } catch {
    return [];
  }
}
