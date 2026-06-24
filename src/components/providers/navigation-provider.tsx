"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteNavigationConfig } from "@/types/navigation";
import { defaultSiteNavigation } from "@/config/navigation.defaults";

const NavigationContext = createContext<SiteNavigationConfig>(defaultSiteNavigation);

export function NavigationProvider({
  config,
  children,
}: {
  config: SiteNavigationConfig;
  children: ReactNode;
}) {
  return (
    <NavigationContext.Provider value={config}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useSiteNavigation() {
  return useContext(NavigationContext);
}
