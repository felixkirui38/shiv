import { prisma } from "@/lib/prisma";
import { defaultHomepageContent } from "@/config/homepage.defaults";
import { getPublishedWebsiteConfig } from "@/lib/cms/website-builder";
import { listPublishedPosts } from "@/lib/blog/queries";
import { getPostBySlug } from "@/lib/blog/queries";

export async function getPublicWebsiteSections() {
  const config = await getPublishedWebsiteConfig();
  return {
    sectionOrder: config.sectionOrder,
    sectionVisibility: config.sectionVisibility,
    homepage: config.homepage,
    navigation: config.navigation,
    versionId: config.versionId,
  };
}

export async function getPublicCmsPage(slug: string) {
  try {
    const page = await prisma.cmsPage.findUnique({ where: { slug } });
    if (!page?.isPublished) return null;

    return {
      slug: page.slug,
      title: page.title,
      content: page.content,
      blocks: page.blocks,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      updatedAt: page.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getPublicFaqs() {
  try {
    const items = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        sortOrder: true,
      },
    });
    if (items.length > 0) return items;
  } catch {
    // fall through
  }

  return defaultHomepageContent.faq.items.map((item, index) => ({
    id: `default-${index}`,
    question: item.question,
    answer: item.answer,
    category: null,
    sortOrder: index,
  }));
}

export async function getPublicTestimonials() {
  try {
    const items = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        role: true,
        company: true,
        content: true,
        rating: true,
        sortOrder: true,
      },
    });
    if (items.length > 0) return items;
  } catch {
    // fall through
  }

  return defaultHomepageContent.testimonials.items.map((item, index) => ({
    id: `default-${index}`,
    name: item.name,
    role: item.role ?? null,
    company: null,
    content: item.content,
    rating: item.rating ?? 5,
    sortOrder: index,
  }));
}

export async function getPublicPartners() {
  try {
    const items = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { logo: { select: { url: true, alt: true } } },
    });
    if (items.length > 0) {
      return items.map((p) => ({
        id: p.id,
        name: p.name,
        website: p.website,
        logoUrl: p.logo?.url ?? null,
        sortOrder: p.sortOrder,
      }));
    }
  } catch {
    // fall through
  }

  return defaultHomepageContent.partners.items.map((item, index) => ({
    id: `default-${index}`,
    name: item.name,
    website: null,
    logoUrl: item.logoUrl ?? null,
    sortOrder: index,
  }));
}

export async function getPublicStatistics() {
  try {
    const items = await prisma.statistic.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        label: true,
        value: true,
        suffix: true,
        icon: true,
        sortOrder: true,
      },
    });
    if (items.length > 0) return items;
  } catch {
    // fall through
  }

  return defaultHomepageContent.statistics.stats.map((item, index) => ({
    id: `default-${index}`,
    label: item.label,
    value: String(item.value),
    suffix: item.suffix ?? null,
    icon: item.icon ?? null,
    sortOrder: index,
  }));
}

export async function getPublicBlogPosts(params: {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  tag?: string;
}) {
  return listPublishedPosts(params);
}

export async function getPublicBlogPost(slug: string) {
  return getPostBySlug(slug, true);
}
