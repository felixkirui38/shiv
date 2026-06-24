import type { SiteNavigationConfig } from "@/types/navigation";

export const defaultSiteNavigation: SiteNavigationConfig = {
  notification: {
    enabled: true,
    message:
      "Trusted insurance brokerage — protecting individuals & businesses since 1999",
    phone: "0700 652040",
    email: "info@shivinsbro.co.ke",
  },
  header: {
    products: [],
    claims: [
      {
        label: "File a Claim",
        href: "/claims",
        description: "Step-by-step claims process",
      },
      {
        label: "Emergency Claims",
        href: "/portal/claims/new",
        description: "Report an urgent incident",
      },
      {
        label: "Track a Claim",
        href: "/portal/claims",
        description: "Check your claim status online",
      },
      {
        label: "Claims FAQ",
        href: "/faq",
        description: "Common claims questions answered",
      },
    ],
    about: [
      {
        label: "About Us",
        href: "/about",
        description: "Our story, mission and values",
      },
      {
        label: "Careers",
        href: "/careers",
        description: "Join the Shiv Insurance team",
      },
      {
        label: "Our Partners",
        href: "/#partners",
        description: "Leading insurance underwriters",
      },
      {
        label: "Why Choose Us",
        href: "/about#why-us",
        description: "What sets us apart",
      },
    ],
    blog: [
      {
        label: "All Articles",
        href: "/blog",
        description: "Insurance insights and news",
      },
      {
        label: "Motor Insurance",
        href: "/blog?category=motor",
        description: "Vehicle coverage guides",
      },
      {
        label: "Medical Insurance",
        href: "/blog?category=medical",
        description: "Health scheme advice",
      },
      {
        label: "Business Insurance",
        href: "/blog?category=business",
        description: "Commercial risk insights",
      },
    ],
    contact: [
      {
        label: "Contact Us",
        href: "/contact",
        description: "Send us a message",
      },
      {
        label: "Purchase Insurance",
        href: "/products",
        description: "Buy cover online",
      },
      {
        label: "Office Location",
        href: "/contact#location",
        description: "Visit our Westlands office",
      },
      {
        label: "Client Portal",
        href: "/login",
        description: "Access your account",
      },
    ],
  },
  actions: {
    quoteLabel: "Purchase Insurance",
    quoteHref: "/products",
    emergencyLabel: "Emergency Claims",
    emergencyHref: "/portal/claims/new",
    loginLabel: "Customer Login",
    loginHref: "/login",
  },
  footer: {
    companyDescription:
      "Shiv Insurance Brokers is a licensed insurance brokerage providing professional risk management and comprehensive coverage solutions across Kenya.",
    columns: [
      {
        title: "Insurance Products",
        links: [],
      },
      {
        title: "Useful Links",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
          { label: "FAQ", href: "/faq" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Claims Support",
        links: [
          { label: "File a Claim", href: "/claims" },
          { label: "Emergency Claims", href: "/portal/claims/new" },
          { label: "Track a Claim", href: "/portal/claims" },
          { label: "Client Portal", href: "/portal/dashboard" },
        ],
      },
    ],
    social: [
      {
        platform: "facebook",
        href: "https://facebook.com",
        label: "Facebook",
      },
      {
        platform: "linkedin",
        href: "https://linkedin.com",
        label: "LinkedIn",
      },
      {
        platform: "twitter",
        href: "https://twitter.com",
        label: "Twitter",
      },
      {
        platform: "instagram",
        href: "https://instagram.com",
        label: "Instagram",
      },
    ],
    newsletter: {
      enabled: true,
      title: "Stay Informed",
      description:
        "Subscribe for insurance tips, product updates, and industry news.",
    },
    copyright: "Shiv Insurance Brokers Ltd. All rights reserved.",
    license: "Licensed Insurance Broker — IRA/06/267/2024",
  },
};
