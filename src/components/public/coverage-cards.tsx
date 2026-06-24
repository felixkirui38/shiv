import { Check } from "lucide-react";
import { AnimatedSection } from "@/components/shared/animated-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const coverages = [
  {
    title: "Third Party Liability",
    items: ["Bodily injury cover", "Property damage", "Legal defence costs"],
  },
  {
    title: "Comprehensive Cover",
    items: ["Accident damage", "Theft & fire", "Natural calamities"],
  },
  {
    title: "Medical Benefits",
    items: ["Inpatient care", "Outpatient services", "Maternity cover"],
  },
  {
    title: "Business Protection",
    items: ["Public liability", "Employer liability", "Business interruption"],
  },
];

export function CoverageCards() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-12">
          <div className="accent-bar mb-4" />
          <h2 className="mb-3 font-heading text-3xl font-semibold text-dark">
            Coverage Options
          </h2>
          <p className="max-w-2xl text-body">
            Flexible coverage plans designed to meet individual, family, and
            corporate insurance requirements.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {coverages.map((coverage, i) => (
            <AnimatedSection key={coverage.title} delay={i * 0.08}>
              <Card className="h-full border-brand bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="border-b border-brand bg-brand-light">
                  <CardTitle className="font-heading text-base font-semibold text-primary">
                    {coverage.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {coverage.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-body">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
