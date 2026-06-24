"use client";

import { AnimatedSection } from "@/components/shared/animated-section";
import { useCounter } from "@/hooks/use-counter";

const stats = [
  { value: 25, suffix: "+", label: "Years of Service" },
  { value: 10000, suffix: "+", label: "Policies Managed" },
  { value: 5000, suffix: "+", label: "Claims Processed" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
];

function StatItem({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const { count, ref } = useCounter(value);

  return (
    <div ref={ref} className="text-center">
      <p className="font-heading text-4xl font-semibold text-white md:text-5xl">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-white/75">{label}</p>
    </div>
  );
}

export function StatisticsSection() {
  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">
            Trusted by Thousands Across Kenya
          </h2>
        </AnimatedSection>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1}>
              <StatItem {...stat} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
