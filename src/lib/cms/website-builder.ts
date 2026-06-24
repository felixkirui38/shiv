import { prisma } from "@/lib/prisma";
import { defaultHomepageContent } from "@/config/homepage.defaults";
import { defaultSiteNavigation } from "@/config/navigation.defaults";
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
} from "@/config/website-builder.defaults";
import { getFeaturedPosts, toHomepageBlogPost } from "@/lib/blog";
import type { HomepageContent } from "@/types/homepage";
import type { SiteNavigationConfig } from "@/types/navigation";
import type {
  WebsiteBuilderPayload,
  WebsiteBuilderState,
  WebsiteSectionId,
  WebsiteVersionSummary,
} from "@/types/website-builder";

const HOMEPAGE_SETTING_KEY = "homepage_content";
const NAV_SETTING_KEY = "site_navigation";

function mergeHomepage(stored: Partial<HomepageContent>): HomepageContent {
  return {
    ...defaultHomepageContent,
    ...stored,
    hero: { ...defaultHomepageContent.hero, ...stored.hero },
    products: { ...defaultHomepageContent.products, ...stored.products },
    insuranceFinder: {
      ...defaultHomepageContent.insuranceFinder,
      ...stored.insuranceFinder,
    },
    calculator: { ...defaultHomepageContent.calculator, ...stored.calculator },
    howItWorks: { ...defaultHomepageContent.howItWorks, ...stored.howItWorks },
    claims: { ...defaultHomepageContent.claims, ...stored.claims },
    statistics: { ...defaultHomepageContent.statistics, ...stored.statistics },
    whyChooseUs: { ...defaultHomepageContent.whyChooseUs, ...stored.whyChooseUs },
    partners: { ...defaultHomepageContent.partners, ...stored.partners },
    testimonials: {
      ...defaultHomepageContent.testimonials,
      ...stored.testimonials,
    },
    blog: { ...defaultHomepageContent.blog, ...stored.blog },
    faq: { ...defaultHomepageContent.faq, ...stored.faq },
    cta: { ...defaultHomepageContent.cta, ...stored.cta },
  };
}

function mergeNavigation(stored: Partial<SiteNavigationConfig>): SiteNavigationConfig {
  return {
    ...defaultSiteNavigation,
    ...stored,
    notification: { ...defaultSiteNavigation.notification, ...stored.notification },
    header: { ...defaultSiteNavigation.header, ...stored.header },
    actions: { ...defaultSiteNavigation.actions, ...stored.actions },
    footer: {
      ...defaultSiteNavigation.footer,
      ...stored.footer,
      columns: stored.footer?.columns ?? defaultSiteNavigation.footer.columns,
      social: stored.footer?.social ?? defaultSiteNavigation.footer.social,
      newsletter: {
        ...defaultSiteNavigation.footer.newsletter,
        ...stored.footer?.newsletter,
      },
    },
  };
}

async function injectBlogPosts(homepage: HomepageContent): Promise<HomepageContent> {
  try {
    const featuredPosts = await getFeaturedPosts(3);
    if (featuredPosts.length > 0) {
      return {
        ...homepage,
        blog: {
          ...homepage.blog,
          posts: featuredPosts.map(toHomepageBlogPost),
        },
      };
    }
  } catch {
    // DB unavailable
  }
  return homepage;
}

async function loadLegacySettings(): Promise<{
  homepage: HomepageContent;
  navigation: SiteNavigationConfig;
}> {
  const [homepageSetting, navSetting] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: HOMEPAGE_SETTING_KEY } }),
    prisma.siteSetting.findUnique({ where: { key: NAV_SETTING_KEY } }),
  ]);

  const homepage = homepageSetting?.value
    ? mergeHomepage(homepageSetting.value as Partial<HomepageContent>)
    : defaultHomepageContent;

  const navigation = navSetting?.value
    ? mergeNavigation(navSetting.value as Partial<SiteNavigationConfig>)
    : defaultSiteNavigation;

  return { homepage, navigation };
}

function parseSectionOrder(value: unknown): WebsiteSectionId[] {
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return value as WebsiteSectionId[];
  }
  return DEFAULT_SECTION_ORDER;
}

function parseSectionVisibility(value: unknown): Record<WebsiteSectionId, boolean> {
  if (value && typeof value === "object") {
    return { ...DEFAULT_SECTION_VISIBILITY, ...(value as Record<WebsiteSectionId, boolean>) };
  }
  return { ...DEFAULT_SECTION_VISIBILITY };
}

async function syncLegacySettings(payload: WebsiteBuilderPayload) {
  await Promise.all([
    prisma.siteSetting.upsert({
      where: { key: HOMEPAGE_SETTING_KEY },
      update: { value: payload.homepage as object, group: "homepage" },
      create: {
        key: HOMEPAGE_SETTING_KEY,
        value: payload.homepage as object,
        group: "homepage",
      },
    }),
    prisma.siteSetting.upsert({
      where: { key: NAV_SETTING_KEY },
      update: { value: payload.navigation as object, group: "navigation" },
      create: {
        key: NAV_SETTING_KEY,
        value: payload.navigation as object,
        group: "navigation",
      },
    }),
  ]);
}

async function nextVersionNumber() {
  const latest = await prisma.websiteVersion.findFirst({
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });
  return (latest?.versionNumber ?? 0) + 1;
}

export async function getPublishedWebsiteConfig(): Promise<{
  homepage: HomepageContent;
  navigation: SiteNavigationConfig;
  sectionOrder: WebsiteSectionId[];
  sectionVisibility: Record<WebsiteSectionId, boolean>;
  versionId: string | null;
}> {
  try {
    const published = await prisma.websiteVersion.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    });

    if (published) {
      const homepage = mergeHomepage(published.homepage as Partial<HomepageContent>);
      return {
        homepage: await injectBlogPosts(homepage),
        navigation: mergeNavigation(published.navigation as Partial<SiteNavigationConfig>),
        sectionOrder: parseSectionOrder(published.sectionOrder),
        sectionVisibility: parseSectionVisibility(published.sectionVisibility),
        versionId: published.id,
      };
    }

    const legacy = await loadLegacySettings();
    return {
      homepage: await injectBlogPosts(legacy.homepage),
      navigation: legacy.navigation,
      sectionOrder: DEFAULT_SECTION_ORDER,
      sectionVisibility: DEFAULT_SECTION_VISIBILITY,
      versionId: null,
    };
  } catch {
    return {
      homepage: defaultHomepageContent,
      navigation: defaultSiteNavigation,
      sectionOrder: DEFAULT_SECTION_ORDER,
      sectionVisibility: DEFAULT_SECTION_VISIBILITY,
      versionId: null,
    };
  }
}

export async function getBuilderState(): Promise<WebsiteBuilderState> {
  const [draft, published] = await Promise.all([
    prisma.websiteVersion.findFirst({
      where: { status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.websiteVersion.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  if (draft) {
    return {
      draftVersionId: draft.id,
      publishedVersionId: published?.id ?? null,
      homepage: mergeHomepage(draft.homepage as Partial<HomepageContent>),
      navigation: mergeNavigation(draft.navigation as Partial<SiteNavigationConfig>),
      sectionOrder: parseSectionOrder(draft.sectionOrder),
      sectionVisibility: parseSectionVisibility(draft.sectionVisibility),
      hasUnpublishedChanges: true,
    };
  }

  if (published) {
    return {
      draftVersionId: null,
      publishedVersionId: published.id,
      homepage: mergeHomepage(published.homepage as Partial<HomepageContent>),
      navigation: mergeNavigation(published.navigation as Partial<SiteNavigationConfig>),
      sectionOrder: parseSectionOrder(published.sectionOrder),
      sectionVisibility: parseSectionVisibility(published.sectionVisibility),
      hasUnpublishedChanges: false,
    };
  }

  const legacy = await loadLegacySettings();
  return {
    draftVersionId: null,
    publishedVersionId: null,
    homepage: legacy.homepage,
    navigation: legacy.navigation,
    sectionOrder: DEFAULT_SECTION_ORDER,
    sectionVisibility: DEFAULT_SECTION_VISIBILITY,
    hasUnpublishedChanges: false,
  };
}

export async function saveBuilderDraft(
  payload: WebsiteBuilderPayload,
  userId?: string
): Promise<WebsiteBuilderState> {
  const existingDraft = await prisma.websiteVersion.findFirst({
    where: { status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
  });

  if (existingDraft) {
    await prisma.websiteVersion.update({
      where: { id: existingDraft.id },
      data: {
        homepage: payload.homepage as object,
        navigation: payload.navigation as object,
        sectionOrder: payload.sectionOrder as object,
        sectionVisibility: payload.sectionVisibility as object,
        label: payload.label ?? existingDraft.label,
        createdById: userId ?? existingDraft.createdById,
      },
    });
  } else {
    const versionNumber = await nextVersionNumber();
    await prisma.websiteVersion.create({
      data: {
        versionNumber,
        status: "DRAFT",
        label: payload.label ?? `Draft v${versionNumber}`,
        homepage: payload.homepage as object,
        navigation: payload.navigation as object,
        sectionOrder: payload.sectionOrder as object,
        sectionVisibility: payload.sectionVisibility as object,
        createdById: userId,
      },
    });
  }

  return getBuilderState();
}

export async function publishBuilder(userId?: string) {
  let draft = await prisma.websiteVersion.findFirst({
    where: { status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
  });

  if (!draft) {
    const state = await getBuilderState();
    const versionNumber = await nextVersionNumber();
    draft = await prisma.websiteVersion.create({
      data: {
        versionNumber,
        status: "DRAFT",
        label: `Draft v${versionNumber}`,
        homepage: state.homepage as object,
        navigation: state.navigation as object,
        sectionOrder: state.sectionOrder as object,
        sectionVisibility: state.sectionVisibility as object,
        createdById: userId,
      },
    });
  }

  await prisma.websiteVersion.updateMany({
    where: { status: "PUBLISHED" },
    data: { status: "ARCHIVED" },
  });

  const published = await prisma.websiteVersion.update({
    where: { id: draft.id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      createdById: userId ?? draft.createdById,
    },
  });

  await syncLegacySettings({
    homepage: mergeHomepage(published.homepage as Partial<HomepageContent>),
    navigation: mergeNavigation(published.navigation as Partial<SiteNavigationConfig>),
    sectionOrder: parseSectionOrder(published.sectionOrder),
    sectionVisibility: parseSectionVisibility(published.sectionVisibility),
  });

  return published;
}

export async function rollbackToVersion(versionId: string, userId?: string) {
  const source = await prisma.websiteVersion.findUnique({ where: { id: versionId } });
  if (!source) throw new Error("Version not found");

  await prisma.websiteVersion.deleteMany({ where: { status: "DRAFT" } });

  const versionNumber = await nextVersionNumber();
  const draft = await prisma.websiteVersion.create({
    data: {
      versionNumber,
      status: "DRAFT",
      label: `Rollback from v${source.versionNumber}`,
      homepage: source.homepage as object,
      navigation: source.navigation as object,
      sectionOrder: source.sectionOrder as object,
      sectionVisibility: source.sectionVisibility as object,
      createdById: userId,
    },
  });

  return draft;
}

export async function publishVersionDirectly(versionId: string, userId?: string) {
  const source = await prisma.websiteVersion.findUnique({ where: { id: versionId } });
  if (!source) throw new Error("Version not found");

  await prisma.websiteVersion.deleteMany({ where: { status: "DRAFT" } });
  await prisma.websiteVersion.updateMany({
    where: { status: "PUBLISHED" },
    data: { status: "ARCHIVED" },
  });

  const published = await prisma.websiteVersion.create({
    data: {
      versionNumber: await nextVersionNumber(),
      status: "PUBLISHED",
      label: source.label ?? `Restored v${source.versionNumber}`,
      homepage: source.homepage as object,
      navigation: source.navigation as object,
      sectionOrder: source.sectionOrder as object,
      sectionVisibility: source.sectionVisibility as object,
      createdById: userId,
      publishedAt: new Date(),
    },
  });

  await syncLegacySettings({
    homepage: mergeHomepage(published.homepage as Partial<HomepageContent>),
    navigation: mergeNavigation(published.navigation as Partial<SiteNavigationConfig>),
    sectionOrder: parseSectionOrder(published.sectionOrder),
    sectionVisibility: parseSectionVisibility(published.sectionVisibility),
  });

  return published;
}

export async function listWebsiteVersions(): Promise<WebsiteVersionSummary[]> {
  const versions = await prisma.websiteVersion.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      createdBy: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return versions.map((v) => ({
    id: v.id,
    versionNumber: v.versionNumber,
    status: v.status,
    label: v.label,
    publishedAt: v.publishedAt?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
    createdByName: v.createdBy
      ? `${v.createdBy.firstName ?? ""} ${v.createdBy.lastName ?? ""}`.trim() ||
        v.createdBy.email
      : null,
  }));
}
