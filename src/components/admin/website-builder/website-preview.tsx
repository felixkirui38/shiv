"use client";

import { NavigationProvider } from "@/components/providers/navigation-provider";
import { HomepageProvider } from "@/components/providers/homepage-provider";
import { HomepageSections } from "@/components/homepage/homepage-sections";
import { NotificationBar } from "@/components/layout/notification-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import type { HomepageContent } from "@/types/homepage";
import type { SiteNavigationConfig } from "@/types/navigation";
import type { WebsiteSectionId } from "@/types/website-builder";

interface WebsitePreviewProps {
  homepage: HomepageContent;
  navigation: SiteNavigationConfig;
  sectionOrder: WebsiteSectionId[];
  sectionVisibility: Record<WebsiteSectionId, boolean>;
}

export function WebsitePreview({
  homepage,
  navigation,
  sectionOrder,
  sectionVisibility,
}: WebsitePreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
      <div className="border-b bg-white px-3 py-2 text-xs text-slate-500">
        Live preview — scroll to inspect sections
      </div>
      <div className="max-h-[70vh] overflow-y-auto bg-white">
        <NavigationProvider config={navigation}>
          <NotificationBar config={navigation.notification} />
          <SiteHeader />
          <HomepageProvider
            content={homepage}
            sectionOrder={sectionOrder}
            sectionVisibility={sectionVisibility}
          >
            <HomepageSections />
          </HomepageProvider>
          <SiteFooter />
        </NavigationProvider>
      </div>
    </div>
  );
}
