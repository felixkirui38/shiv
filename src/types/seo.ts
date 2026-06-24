export interface SeoOrganization {
  name: string;
  legalName?: string;
  url: string;
  logo: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
}

export interface SeoRobotsConfig {
  index: boolean;
  follow: boolean;
  noArchive?: boolean;
  noSnippet?: boolean;
  googleBot?: string;
}

export interface SeoSitemapConfig {
  enabled: boolean;
  includeBlog: boolean;
  includeProducts: boolean;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  excludePaths: string[];
}

export interface SeoGlobalSettings {
  siteName: string;
  siteUrl: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  twitterHandle?: string;
  twitterCard: "summary" | "summary_large_image";
  ogLocale: string;
  robots: SeoRobotsConfig;
  sitemap: SeoSitemapConfig;
  organization: SeoOrganization;
}

export interface SeoPageOverride {
  path: string;
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface SeoPageOverrides {
  [path: string]: Omit<SeoPageOverride, "path">;
}

export interface SeoCmsData {
  global: SeoGlobalSettings;
  pages: SeoPageOverrides;
}

export interface AutoSeoInput {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}
