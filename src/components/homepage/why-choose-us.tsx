"use client";

import { useHomepage } from "@/components/providers/homepage-provider";
import {
  AnimatedSection,
  SectionHeader,
} from "@/components/homepage/section-primitives";
import { Card, CardContent } from "@/components/ui/card";
import { getIcon } from "@/lib/icons";

export function WhyChooseUsSection() {
  const { whyChooseUs } = useHomepage();

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <SectionHeader
            title={whyChooseUs.title}
            subtitle={whyChooseUs.subtitle}
          />
        </AnimatedSection>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.reasons.map((reason, i) => {
            const Icon = getIcon(reason.icon);
            return (
              <AnimatedSection key={reason.title} delay={i * 0.06}>
                <Card className="h-full border-brand bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="flex gap-4 p-6">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="mb-1.5 font-heading text-base font-semibold text-dark">
                        {reason.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-body">
                        {reason.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
