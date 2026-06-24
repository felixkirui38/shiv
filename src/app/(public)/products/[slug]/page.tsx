import { notFound } from "next/navigation";
import { getProductBySlug, getProductSlugs } from "@/lib/products/queries";
import {
  buildProductJsonLd,
  buildProductMetadata,
} from "@/lib/products/seo";
import { ProductDetailView } from "@/components/products/product-detail";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await getProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return buildProductMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const jsonLd = await buildProductJsonLd(product);

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProductDetailView product={product} />
    </>
  );
}
