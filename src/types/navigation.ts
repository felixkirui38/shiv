export interface NavLink {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  children?: NavLink[];
}

export interface NotificationConfig {
  enabled: boolean;
  message: string;
  phone?: string;
  email?: string;
}

export interface HeaderActionsConfig {
  quoteLabel: string;
  quoteHref: string;
  emergencyLabel: string;
  emergencyHref: string;
  loginLabel: string;
  loginHref: string;
}

export interface HeaderNavConfig {
  products: NavLink[];
  claims: NavLink[];
  about: NavLink[];
  blog: NavLink[];
  contact: NavLink[];
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface SocialLink {
  platform: "facebook" | "twitter" | "linkedin" | "instagram" | "youtube";
  href: string;
  label: string;
}

export interface NewsletterConfig {
  enabled: boolean;
  title: string;
  description: string;
}

export interface FooterConfig {
  companyDescription: string;
  columns: FooterColumn[];
  social: SocialLink[];
  newsletter: NewsletterConfig;
  copyright: string;
  license: string;
}

export interface SiteNavigationConfig {
  notification: NotificationConfig;
  header: HeaderNavConfig;
  actions: HeaderActionsConfig;
  footer: FooterConfig;
}
