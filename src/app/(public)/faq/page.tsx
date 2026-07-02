import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getPublicFaqs } from "@/lib/cms/public-content";
import { FaqAccordion } from "@/components/public/faq-accordion";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/faq", {
    title: "FAQ",
    description: "Frequently asked questions about Shiv Insurance products and services.",
  });
}

export default async function FaqPage() {
  const faqs = await getPublicFaqs();

  return (
    <div className="section-light py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <div className="accent-bar mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-semibold text-dark md:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-body">
              Answers to common questions about our products, claims, and services.
            </p>
          </div>
          <FaqAccordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
        </div>
      </div>
    </div>
  );
}
