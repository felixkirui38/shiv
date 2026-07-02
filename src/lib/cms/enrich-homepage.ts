import type { HomepageContent } from "@/types/homepage";
import {
  getPublicFaqs,
  getPublicPartners,
  getPublicStatistics,
  getPublicTestimonials,
} from "@/lib/cms/public-content";

function parseStatValue(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export async function enrichHomepageWithDbContent(
  homepage: HomepageContent
): Promise<HomepageContent> {
  const [faqs, testimonials, partners, statistics] = await Promise.all([
    getPublicFaqs(),
    getPublicTestimonials(),
    getPublicPartners(),
    getPublicStatistics(),
  ]);

  const hasDbFaqs = faqs.some((f) => !f.id.startsWith("default-"));
  const hasDbTestimonials = testimonials.some((t) => !t.id.startsWith("default-"));
  const hasDbPartners = partners.some((p) => !p.id.startsWith("default-"));
  const hasDbStats = statistics.some((s) => !s.id.startsWith("default-"));

  return {
    ...homepage,
    faq: hasDbFaqs
      ? {
          ...homepage.faq,
          items: faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
        }
      : homepage.faq,
    testimonials: hasDbTestimonials
      ? {
          ...homepage.testimonials,
          items: testimonials.map((t) => ({
            name: t.name,
            role: t.role ?? "",
            content: t.content,
            rating: t.rating ?? 5,
          })),
        }
      : homepage.testimonials,
    partners: hasDbPartners
      ? {
          ...homepage.partners,
          items: partners.map((p) => ({
            name: p.name,
            logoUrl: p.logoUrl ?? undefined,
            website: p.website ?? undefined,
          })),
        }
      : homepage.partners,
    statistics: hasDbStats
      ? {
          ...homepage.statistics,
          stats: statistics.map((s) => ({
            value: parseStatValue(s.value),
            suffix: s.suffix ?? "",
            label: s.label,
          })),
        }
      : homepage.statistics,
  };
}
