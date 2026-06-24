"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { useHomepage } from "@/components/providers/homepage-provider";
import { AnimatedSection } from "@/components/homepage/section-primitives";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function CtaSection() {
  const { cta } = useHomepage();

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-xl border border-brand bg-primary px-6 py-12 text-center shadow-lg md:px-16 md:py-14">
            <div className="absolute top-0 left-0 h-1 w-full bg-accent" />
            <h2 className="mb-4 font-heading text-3xl font-semibold text-white md:text-4xl">
              {cta.title}
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/80">{cta.subtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={cta.primaryButtonHref}
                className={buttonVariants({ variant: "accent", size: "lg" })}
              >
                {cta.primaryButtonLabel}
              </Link>
              <Link
                href={cta.secondaryButtonHref}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 border-white/30 bg-transparent text-white hover:bg-white/10"
                )}
              >
                <Phone className="size-4" />
                {cta.secondaryButtonLabel}
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
