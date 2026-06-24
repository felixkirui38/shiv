import type { HomepageContent } from "@/types/homepage";
import type { SiteNavigationConfig } from "@/types/navigation";

export type WebsiteSectionId =
  | "hero"
  | "insuranceFinder"
  | "products"
  | "calculator"
  | "howItWorks"
  | "claims"
  | "statistics"
  | "whyChooseUs"
  | "partners"
  | "testimonials"
  | "blog"
  | "faq"
  | "cta";

export type WebsiteEditorPanel =
  | WebsiteSectionId
  | "header"
  | "footer";

export interface WebsiteBuilderState {
  draftVersionId: string | null;
  publishedVersionId: string | null;
  homepage: HomepageContent;
  navigation: SiteNavigationConfig;
  sectionOrder: WebsiteSectionId[];
  sectionVisibility: Record<WebsiteSectionId, boolean>;
  hasUnpublishedChanges: boolean;
}

export interface WebsiteVersionSummary {
  id: string;
  versionNumber: number;
  status: string;
  label: string | null;
  publishedAt: string | null;
  createdAt: string;
  createdByName: string | null;
}

export interface WebsiteBuilderPayload {
  homepage: HomepageContent;
  navigation: SiteNavigationConfig;
  sectionOrder: WebsiteSectionId[];
  sectionVisibility: Record<WebsiteSectionId, boolean>;
  label?: string;
}
