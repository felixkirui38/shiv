"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { HomepageContent } from "@/types/homepage";
import type { WebsiteSectionId } from "@/types/website-builder";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "@/config/website-builder.defaults";
import { defaultHomepageContent } from "@/config/homepage.defaults";

interface HomepageContextValue {
  content: HomepageContent;
  sectionOrder: WebsiteSectionId[];
  sectionVisibility: Record<WebsiteSectionId, boolean>;
}

const HomepageContext = createContext<HomepageContextValue>({
  content: defaultHomepageContent,
  sectionOrder: DEFAULT_SECTION_ORDER,
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
});

export function HomepageProvider({
  content,
  sectionOrder = DEFAULT_SECTION_ORDER,
  sectionVisibility = DEFAULT_SECTION_VISIBILITY,
  children,
}: {
  content: HomepageContent;
  sectionOrder?: WebsiteSectionId[];
  sectionVisibility?: Record<WebsiteSectionId, boolean>;
  children: ReactNode;
}) {
  return (
    <HomepageContext.Provider value={{ content, sectionOrder, sectionVisibility }}>
      {children}
    </HomepageContext.Provider>
  );
}

export function useHomepage() {
  return useContext(HomepageContext).content;
}

export function useWebsiteLayout() {
  const ctx = useContext(HomepageContext);
  return {
    sectionOrder: ctx.sectionOrder,
    sectionVisibility: ctx.sectionVisibility,
  };
}
