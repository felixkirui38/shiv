import { AnimatedSection } from "@/components/shared/animated-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What types of insurance does Shiv Insurance Brokers offer?",
    a: "We offer motor, medical, travel, life, home, business, and marine insurance through leading underwriters in Kenya.",
  },
  {
    q: "How do I file an insurance claim?",
    a: "Claims can be filed through our client portal, by calling our office, or via email. Our claims team will guide you through the required documentation.",
  },
  {
    q: "How long does the claims process take?",
    a: "Most straightforward claims are processed within 5–10 business days, depending on the complexity and completeness of documentation.",
  },
  {
    q: "Can I pay my premiums in instalments?",
    a: "Yes, we offer flexible payment options including monthly, quarterly, and annual premium schedules for most insurance products.",
  },
  {
    q: "Is Shiv Insurance Brokers licensed?",
    a: "Yes, we are a fully licensed insurance broker regulated by the Insurance Regulatory Authority (IRA/06/267/2024).",
  },
];

export function FAQSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <AnimatedSection className="mb-10 text-center">
            <div className="accent-bar mx-auto mb-4" />
            <h2 className="mb-3 font-heading text-3xl font-semibold text-dark">
              Frequently Asked Questions
            </h2>
            <p className="text-body">
              Find answers to common questions about our insurance products and
              services.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Accordion className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-md border border-brand bg-white px-4 shadow-sm"
                >
                  <AccordionTrigger className="font-heading text-sm font-semibold text-dark hover:text-primary hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-body">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
