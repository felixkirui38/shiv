"use client";

import { type ReactNode } from "react";
import type { SiteNavigationConfig } from "@/types/navigation";
import { NavigationProvider } from "@/components/providers/navigation-provider";
import { NotificationBar } from "@/components/layout/notification-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ScrollProgressBar } from "@/components/layout/scroll-progress-bar";
import { AiAdvisorWidget } from "@/components/ai-advisor/ai-advisor-widget";

interface SiteShellProps {
  navigation: SiteNavigationConfig;
  children: ReactNode;
  showBreadcrumbs?: boolean;
}

export function SiteShell({
  navigation,
  children,
  showBreadcrumbs = true,
}: SiteShellProps) {
  return (
    <NavigationProvider config={navigation}>
      <ScrollProgressBar />
      <NotificationBar config={navigation.notification} />
      <SiteHeader />
      {showBreadcrumbs && <Breadcrumbs />}
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter />
      <AiAdvisorWidget />
    </NavigationProvider>
  );
}
