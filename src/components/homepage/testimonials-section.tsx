"use client";

import { Quote } from "lucide-react";
import { useHomepage } from "@/components/providers/homepage-provider";
import {
  AnimatedSection,
  SectionHeader,
} from "@/components/homepage/section-primitives";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSection() {
  const { testimonials } = useHomepage();

  return (
    <section className="section-light py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <SectionHeader
            title={testimonials.title}
            subtitle={testimonials.subtitle}
          />
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 0.1}>
              <Card className="h-full border-brand bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <Quote className="mb-4 size-8 text-accent/50" />
                  <p className="mb-6 text-sm leading-relaxed text-body">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="text-accent">
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-brand pt-4">
                    <p className="font-heading text-sm font-semibold text-dark">
                      {t.name}
                    </p>
                    <p className="text-xs text-body">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
