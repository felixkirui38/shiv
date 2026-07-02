import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo";
import { ProductListing } from "@/components/products/product-listing";
import { QuoteForm } from "@/components/public/quote-form";
import { AnimatedSection } from "@/components/shared/animated-section";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/products", {
    title: "Insurance Products",
    description:
      "Browse our comprehensive range of insurance products — motor, medical, travel, life, business, marine, and home cover.",
  });
}

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection>
        <div className="accent-bar mb-4" />
        <h1 className="mb-4 font-heading text-4xl font-semibold text-dark">
          Insurance Products
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-body">
          Choose from our comprehensive range of insurance products designed to
          protect you, your family, and your assets. All products are managed
          through our CMS — explore coverage, calculate premiums, and apply online.
        </p>
      </AnimatedSection>
      <ProductListing products={products} />
      <QuoteForm />
    </div>
  );
}
