"use client";

import type { ComponentType } from "react";
import { HeroSection } from "@/components/homepage/hero-section";
import { InsuranceFinderSection } from "@/components/homepage/insurance-finder";
import { ProductsGridSection } from "@/components/homepage/products-grid";
import { CoverageCalculatorSection } from "@/components/homepage/coverage-calculator";
import { HowItWorksSection } from "@/components/homepage/how-it-works-section";
import { ClaimsProcessSection } from "@/components/homepage/claims-process-section";
import { CompanyStatisticsSection } from "@/components/homepage/company-statistics";
import { WhyChooseUsSection } from "@/components/homepage/why-choose-us";
import { PartnersSection } from "@/components/homepage/partners-section";
import { TestimonialsSection } from "@/components/homepage/testimonials-section";
import { RecentBlogsSection } from "@/components/homepage/recent-blogs";
import { FaqSection } from "@/components/homepage/faq-section";
import { CtaSection } from "@/components/homepage/cta-section";
import { useWebsiteLayout } from "@/components/providers/homepage-provider";
import type { WebsiteSectionId } from "@/types/website-builder";

const SECTION_COMPONENTS: Record<WebsiteSectionId, ComponentType> = {
  hero: HeroSection,
  insuranceFinder: InsuranceFinderSection,
  products: ProductsGridSection,
  calculator: CoverageCalculatorSection,
  howItWorks: HowItWorksSection,
  claims: ClaimsProcessSection,
  statistics: CompanyStatisticsSection,
  whyChooseUs: WhyChooseUsSection,
  partners: PartnersSection,
  testimonials: TestimonialsSection,
  blog: RecentBlogsSection,
  faq: FaqSection,
  cta: CtaSection,
};

export function HomepageSections() {
  const { sectionOrder, sectionVisibility } = useWebsiteLayout();

  return (
    <>
      {sectionOrder.map((id) => {
        if (sectionVisibility[id] === false) return null;
        const Component = SECTION_COMPONENTS[id];
        if (!Component) return null;
        return <Component key={id} />;
      })}
    </>
  );
}
