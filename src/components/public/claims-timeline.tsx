import { AnimatedSection } from "@/components/shared/animated-section";

const steps = [
  {
    step: "01",
    title: "Report Incident",
    description:
      "Notify us of your claim via the client portal, phone, or email with basic incident details.",
  },
  {
    step: "02",
    title: "Documentation",
    description:
      "Submit required documents such as police reports, medical records, or repair estimates.",
  },
  {
    step: "03",
    title: "Assessment",
    description:
      "Our claims team reviews your submission and coordinates with the underwriter for evaluation.",
  },
  {
    step: "04",
    title: "Settlement",
    description:
      "Upon approval, settlement is processed promptly with full transparency on the outcome.",
  },
];

export function ClaimsTimeline() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-12">
          <div className="accent-bar mb-4" />
          <h2 className="mb-3 font-heading text-3xl font-semibold text-dark">
            Claims Process
          </h2>
          <p className="max-w-2xl text-body">
            A straightforward, transparent claims process designed to get you
            back on track as quickly as possible.
          </p>
        </AnimatedSection>

        <div className="relative grid gap-8 md:grid-cols-4">
          <div className="absolute top-8 right-0 left-0 hidden h-0.5 bg-brand md:block" />
          {steps.map((item, i) => (
            <AnimatedSection key={item.step} delay={i * 0.1}>
              <div className="relative">
                <div className="relative z-10 mb-4 flex size-16 items-center justify-center rounded-full border-2 border-primary bg-white font-heading text-lg font-semibold text-primary shadow-sm">
                  {item.step}
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-dark">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-body">
                  {item.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
