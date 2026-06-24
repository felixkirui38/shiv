import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getProductBySlug } from "@/lib/products/queries";
import { buildProductMetadata } from "@/lib/products/seo";
import { PurchaseWizard } from "@/components/purchase/purchase-wizard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Purchase Insurance" };
  return {
    ...buildProductMetadata(product),
    title: `Purchase ${product.name}`,
  };
}

export default async function BuyProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ resume?: string; step?: string }>;
}) {
  const { slug } = await params;
  const { resume, step } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="accent-bar mb-4" />
      <Suspense fallback={<div className="py-12 text-center">Loading…</div>}>
        <PurchaseWizard
          productSlug={slug}
          productName={product.name}
          resumeToken={resume}
          initialStep={step ? Number(step) : 1}
        />
      </Suspense>
    </div>
  );
}
