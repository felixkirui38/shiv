"use client";

import Link from "next/link";
import { useHomepage } from "@/components/providers/homepage-provider";
import {
  AnimatedSection,
  SectionHeader,
} from "@/components/homepage/section-primitives";
import { buttonVariants } from "@/components/ui/button";

export function ClaimsProcessSection() {
  const { claims } = useHomepage();

  return (
    <section className="section-light py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <SectionHeader title={claims.title} subtitle={claims.subtitle} />
        </AnimatedSection>

        <div className="relative">
          <div className="absolute top-10 right-0 left-0 hidden h-0.5 bg-brand md:block" />
          <div className="grid gap-8 md:grid-cols-4">
            {claims.steps.map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 0.1} direction="up">
                <div className="relative text-center md:text-left">
                  <div className="relative z-10 mx-auto mb-4 flex size-16 items-center justify-center rounded-full border-2 border-primary bg-white font-heading text-lg font-semibold text-primary shadow-sm md:mx-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mb-2 font-heading text-base font-semibold text-dark">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">
                    {step.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <AnimatedSection delay={0.3} className="mt-10 text-center">
          <Link
            href="/claims"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Learn About Claims
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
