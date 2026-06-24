import type { WebsiteSectionId } from "@/types/website-builder";

export const DEFAULT_SECTION_ORDER: WebsiteSectionId[] = [
  "hero",
  "insuranceFinder",
  "products",
  "calculator",
  "howItWorks",
  "claims",
  "statistics",
  "whyChooseUs",
  "partners",
  "testimonials",
  "blog",
  "faq",
  "cta",
];

export const BUILDER_SECTION_META: {
  id: WebsiteSectionId;
  label: string;
  description: string;
}[] = [
  { id: "hero", label: "Homepage Hero", description: "Headline, CTAs, hero images" },
  { id: "products", label: "Products", description: "Product grid section titles" },
  { id: "statistics", label: "Statistics", description: "Company stats counters" },
  { id: "claims", label: "Claims Banner", description: "Claims process steps" },
  { id: "partners", label: "Partners", description: "Partner logos and names" },
  { id: "testimonials", label: "Testimonials", description: "Customer reviews" },
  { id: "faq", label: "FAQs", description: "Frequently asked questions" },
  { id: "cta", label: "CTA", description: "Call-to-action banner" },
  { id: "insuranceFinder", label: "Insurance Finder", description: "Coverage finder widget" },
  { id: "calculator", label: "Calculator", description: "Premium calculator section" },
  { id: "howItWorks", label: "How It Works", description: "Process steps" },
  { id: "whyChooseUs", label: "Why Choose Us", description: "Value propositions" },
  { id: "blog", label: "Recent Blog", description: "Blog section titles (posts from CMS)" },
];

export const DEFAULT_SECTION_VISIBILITY: Record<WebsiteSectionId, boolean> = {
  hero: true,
  insuranceFinder: true,
  products: true,
  calculator: true,
  howItWorks: true,
  claims: true,
  statistics: true,
  whyChooseUs: true,
  partners: true,
  testimonials: true,
  blog: true,
  faq: true,
  cta: true,
};

export const LAYOUT_PANELS = [
  { id: "header" as const, label: "Header", description: "Top navigation and actions" },
  { id: "footer" as const, label: "Footer", description: "Footer columns and social links" },
];
