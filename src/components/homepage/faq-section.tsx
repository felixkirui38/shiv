"use client";

import { useHomepage } from "@/components/providers/homepage-provider";
import {
  AnimatedSection,
  SectionHeader,
} from "@/components/homepage/section-primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSection() {
  const { faq } = useHomepage();

  return (
    <section className="section-light py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <AnimatedSection>
            <SectionHeader title={faq.title} subtitle={faq.subtitle} />
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Accordion className="space-y-2">
              {faq.items.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-lg border border-brand bg-white px-4 shadow-sm"
                >
                  <AccordionTrigger className="font-heading text-sm font-semibold text-dark hover:text-primary hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-body">
                    {item.answer}
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
