"use client";

import Image from "next/image";
import { useHomepage } from "@/components/providers/homepage-provider";
import { AnimatedSection } from "@/components/homepage/section-primitives";

export function PartnersSection() {
  const { partners } = useHomepage();

  return (
    <section id="partners" className="border-y border-brand bg-brand-light py-12 md:py-14">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-8 text-center">
          <div className="accent-bar mx-auto mb-4" />
          <h2 className="mb-3 font-heading text-3xl font-semibold text-dark md:text-4xl">
            {partners.title}
          </h2>
          {partners.subtitle && (
            <p className="mx-auto max-w-2xl text-body">{partners.subtitle}</p>
          )}
        </AnimatedSection>
        <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4 lg:grid-cols-8 lg:gap-6">
          {partners.items.map((partner, i) => {
            const inner = partner.logoUrl ? (
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={120}
                height={48}
                className="max-h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-center font-heading text-xs font-semibold text-primary">
                {partner.name}
              </span>
            );

            return (
              <AnimatedSection key={`${partner.name}-${i}`} delay={i * 0.04} direction="fade">
                <div className="flex h-16 items-center justify-center rounded-lg border border-brand bg-white px-3 shadow-sm transition-shadow hover:shadow-md">
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full w-full items-center justify-center"
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
