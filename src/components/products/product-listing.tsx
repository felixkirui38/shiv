import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedSection } from "@/components/shared/animated-section";
import { getIcon } from "@/lib/icons";
import type { getActiveProducts } from "@/lib/products/queries";

type Product = Awaited<ReturnType<typeof getActiveProducts>>[number];

interface ProductListingProps {
  products: Product[];
}

export function ProductListing({ products }: ProductListingProps) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-brand p-12 text-center">
        <p className="text-body">No insurance products are available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => {
        const Icon = getIcon(product.icon ?? "shield");
        const imageUrl =
          product.bannerImage?.url ?? product.heroImage?.url ?? null;

        return (
          <AnimatedSection key={product.id} delay={i * 0.04}>
            <Link href={`/products/${product.slug}`} className="block h-full">
              <Card className="group h-full overflow-hidden border-brand bg-white shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:border-secondary/40 hover:shadow-lg">
                {imageUrl && (
                  <div className="relative h-36 overflow-hidden bg-brand-light">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-5" />
                  </div>
                  {product.category && (
                    <p className="font-heading text-xs font-semibold tracking-wider text-secondary uppercase">
                      {product.category}
                    </p>
                  )}
                  <CardTitle className="font-heading text-lg font-semibold">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-body">
                    {product.shortDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      From KES {product.basePremium.toLocaleString()}/yr
                    </p>
                    <span className="flex items-center gap-1 font-heading text-sm font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                      View details
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </AnimatedSection>
        );
      })}
    </div>
  );
}
