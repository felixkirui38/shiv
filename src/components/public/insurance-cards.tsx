import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedSection } from "@/components/shared/animated-section";
import { getIcon } from "@/lib/icons";
import { getActiveProducts } from "@/lib/products/queries";
import { ArrowRight } from "lucide-react";

export async function InsuranceCards() {
  const products = await getActiveProducts();

  return (
    <section className="section-light py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-12 text-center">
          <div className="accent-bar mx-auto mb-4" />
          <h2 className="mb-3 font-heading text-3xl font-semibold text-dark md:text-4xl">
            Insurance Products
          </h2>
          <p className="mx-auto max-w-2xl text-body">
            Comprehensive coverage solutions tailored to protect what matters most
            to you and your business.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => {
            const Icon = getIcon(product.icon ?? "shield");
            return (
              <AnimatedSection key={product.slug} delay={i * 0.05}>
                <Link href={`/products/${product.slug}`} className="block h-full">
                  <Card className="h-full border-brand bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-secondary/30 hover:shadow-md">
                    <CardHeader>
                      <div className="mb-2 flex size-11 items-center justify-center rounded-md bg-primary/5 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="font-heading text-base font-semibold">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-body">
                        {product.shortDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="flex items-center gap-1 font-heading text-sm font-medium text-secondary">
                        View coverage
                        <ArrowRight className="size-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
