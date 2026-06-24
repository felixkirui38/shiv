"use client";

import { useHomepage } from "@/components/providers/homepage-provider";
import {
  AnimatedSection,
  SectionHeader,
} from "@/components/homepage/section-primitives";
import { FileText, ShieldCheck, Headphones, CheckCircle } from "lucide-react";

const stepIcons = [FileText, ShieldCheck, CheckCircle, Headphones];

export function HowItWorksSection() {
  const { howItWorks } = useHomepage();

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <SectionHeader
            title={howItWorks.title}
            subtitle={howItWorks.subtitle}
          />
        </AnimatedSection>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.steps.map((step, i) => {
            const Icon = stepIcons[i] ?? FileText;
            return (
              <AnimatedSection key={step.title} delay={i * 0.08}>
                <div className="relative text-center">
                  <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-brand bg-white shadow-sm transition-shadow hover:shadow-md">
                    <Icon className="size-7 text-primary" />
                  </div>
                  <span className="mb-2 block font-heading text-xs font-bold tracking-widest text-accent uppercase">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-2 font-heading text-base font-semibold text-dark">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">
                    {step.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
