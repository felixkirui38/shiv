"use client";

import { useHomepage } from "@/components/providers/homepage-provider";
import { AnimatedSection } from "@/components/homepage/section-primitives";
import { useCounter } from "@/hooks/use-counter";

function StatBlock({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const { count, ref } = useCounter(value);

  return (
    <AnimatedSection delay={delay}>
      <div ref={ref} className="text-center">
        <p className="font-heading text-4xl font-semibold text-accent md:text-5xl">
          {count.toLocaleString()}
          {suffix}
        </p>
        <p className="mt-2 text-sm font-medium text-white">{label}</p>
      </div>
    </AnimatedSection>
  );
}

export function CompanyStatisticsSection() {
  const { statistics } = useHomepage();

  return (
    <section className="bg-primary py-14 md:py-16">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">
            {statistics.title}
          </h2>
          {statistics.subtitle && (
            <p className="mt-2 text-white/70">{statistics.subtitle}</p>
          )}
        </AnimatedSection>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.stats.map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-xl bg-secondary/90 px-4 py-8 shadow-sm"
            >
              <StatBlock {...stat} delay={i * 0.1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
