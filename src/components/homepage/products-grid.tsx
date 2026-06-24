"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHomepage } from "@/components/providers/homepage-provider";
import {
  AnimatedSection,
  SectionHeader,
} from "@/components/homepage/section-primitives";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIcon } from "@/lib/icons";

export function ProductsGridSection() {
  const { products } = useHomepage();
  const cards = products.cards
    .filter((c) => c.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section id="products" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <SectionHeader title={products.title} subtitle={products.subtitle} />
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {cards.map((card, i) => {
            const Icon = getIcon(card.icon);
            return (
              <AnimatedSection key={card.id} delay={i * 0.04}>
                <Link href={`/products/${card.slug}`} className="block h-full">
                  <Card className="group h-full border-brand bg-white shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:border-secondary/40 hover:shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="font-heading text-lg font-semibold">
                        {card.label}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-body">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="flex items-center gap-1 font-heading text-sm font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                        Explore coverage
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
