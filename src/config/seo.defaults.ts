import type { SeoCmsData } from "@/types/seo";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Shiv Insurance Brokers";

export const defaultSeoSettings: SeoCmsData = {
  global: {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    titleTemplate: "%s | Shiv Insurance Brokers",
    defaultTitle: "Shiv Insurance Brokers — Trusted Insurance Solutions",
    defaultDescription:
      "Shiv Insurance Brokers provides motor, medical, travel, life, home, and business insurance with professional risk management and claims support.",
    defaultKeywords: [
      "insurance Kenya",
      "motor insurance",
      "medical insurance",
      "Shiv Insurance",
      "insurance brokers Nairobi",
    ],
    defaultOgImage: `${SITE_URL}/images/logo.png`,
    twitterHandle: "@shivinsurance",
    twitterCard: "summary_large_image",
    ogLocale: "en_KE",
    robots: {
      index: true,
      follow: true,
      googleBot: "index, follow, max-image-preview:large, max-snippet:-1",
    },
    sitemap: {
      enabled: true,
      includeBlog: true,
      includeProducts: true,
      changefreq: "weekly",
      excludePaths: ["/admin", "/portal", "/login", "/register", "/api"],
    },
    organization: {
      name: SITE_NAME,
      legalName: "Shiv Insurance Brokers Ltd",
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      telephone: "+254-700-000000",
      email: "info@shivinsbro.co.ke",
      address: {
        streetAddress: "Nairobi",
        addressLocality: "Nairobi",
        addressRegion: "Nairobi County",
        addressCountry: "KE",
      },
      sameAs: [
        "https://facebook.com/shivinsurance",
        "https://twitter.com/shivinsurance",
        "https://linkedin.com/company/shivinsurance",
      ],
    },
  },
  pages: {
    "/": {
      title: "Shiv Insurance Brokers — Trusted Insurance Solutions",
      description:
        "Compare and buy motor, medical, travel, life, and business insurance. Licensed IRA broker with expert claims support.",
    },
    "/about": {
      title: "About Us",
      description: "Learn about Shiv Insurance Brokers — licensed, trusted insurance advisors in Kenya.",
    },
    "/products": {
      title: "Insurance Products",
      description:
        "Browse and purchase motor, medical, travel, life, home, business, and marine insurance online.",
    },
    "/blog": {
      title: "Insurance Blog",
      description: "Expert insurance insights, guides, and news from Shiv Insurance Brokers.",
    },
    "/contact": {
      title: "Contact Us",
      description: "Get in touch with Shiv Insurance Brokers for insurance purchases, claims, and support.",
    },
    "/claims": {
      title: "Claims Process",
      description: "How to file and track insurance claims with Shiv Insurance Brokers.",
    },
    "/faq": {
      title: "Frequently Asked Questions",
      description: "Answers to common questions about insurance products and services.",
    },
  },
};

export const STATIC_SEO_PAGES = [
  { path: "/", label: "Homepage" },
  { path: "/about", label: "About" },
  { path: "/products", label: "Products" },
  { path: "/blog", label: "Blog" },
  { path: "/contact", label: "Contact" },
  { path: "/claims", label: "Claims" },
  { path: "/faq", label: "FAQ" },
  { path: "/careers", label: "Careers" },
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
] as const;
