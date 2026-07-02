"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion className="space-y-2">
      {items.map((item, i) => (
        <AccordionItem
          key={`${item.question}-${i}`}
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
  );
}
