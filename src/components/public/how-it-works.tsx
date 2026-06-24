import { FileText, Headphones, ShieldCheck } from "lucide-react";
import { AnimatedSection } from "@/components/shared/animated-section";

const steps = [
  {
    icon: FileText,
    title: "Request a Quote",
    description:
      "Tell us about your insurance needs through our online form or speak with an advisor.",
  },
  {
    icon: ShieldCheck,
    title: "Compare & Select",
    description:
      "We present options from leading underwriters so you can choose the best coverage.",
  },
  {
    icon: Headphones,
    title: "Ongoing Support",
    description:
      "From policy issuance to renewals and claims — we are with you every step.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-12 text-center">
          <div className="accent-bar mx-auto mb-4" />
          <h2 className="mb-3 font-heading text-3xl font-semibold text-dark">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-body">
            Getting insured with Shiv Insurance Brokers is simple, transparent,
            and professionally managed.
          </p>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 0.1}>
              <div className="text-center">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border-2 border-primary bg-white text-primary shadow-sm">
                  <step.icon className="size-7" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-dark">
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
    </section>
  );
}
