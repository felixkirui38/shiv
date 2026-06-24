import { AnimatedSection } from "@/components/shared/animated-section";

const partners = [
  "APA Insurance",
  "Britam",
  "CIC Insurance",
  "Jubilee",
  "Kenindia",
  "Madison",
  "UAP Old Mutual",
  "Sanlam",
];

export function PartnerLogos() {
  return (
    <section id="partners" className="border-y border-brand bg-white py-14">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-8 text-center">
          <p className="font-heading text-sm font-semibold tracking-wider text-brand-body uppercase">
            Underwritten by Leading Insurers
          </p>
        </AnimatedSection>
        <div className="grid grid-cols-2 items-center gap-8 sm:grid-cols-4 lg:grid-cols-8">
          {partners.map((partner, i) => (
            <AnimatedSection key={partner} delay={i * 0.05}>
              <div className="flex h-16 items-center justify-center rounded-md border border-brand bg-brand-light px-4 transition-shadow hover:shadow-sm">
                <span className="text-center font-heading text-xs font-semibold text-primary">
                  {partner}
                </span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
