import type { SiteNavigationConfig, NavLink } from "@/types/navigation";

export const defaultProductNavLinks: NavLink[] = [
  {
    label: "Motor Insurance",
    href: "/products/motor-insurance",
    description: "Vehicle protection against accidents, theft and liability.",
    icon: "car",
  },
  {
    label: "Medical Insurance",
    href: "/products/medical-insurance",
    description: "Health coverage for individuals, families and groups.",
    icon: "heart",
  },
  {
    label: "Life Insurance",
    href: "/products/life-insurance",
    description: "Financial security for your loved ones.",
    icon: "shield",
  },
  {
    label: "Travel Insurance",
    href: "/products/travel-insurance",
    description: "Protection for domestic and international travel.",
    icon: "plane",
  },
  {
    label: "Business Insurance",
    href: "/products/business-insurance",
    description: "Commercial liability, property and interruption cover.",
    icon: "building",
  },
  {
    label: "Marine Insurance",
    href: "/products/marine-insurance",
    description: "Cargo, hull and freight transit insurance.",
    icon: "ship",
  },
  {
    label: "Pet Insurance",
    href: "/products/pet-insurance",
    description: "Veterinary care for your beloved pets.",
    icon: "paw",
  },
  {
    label: "Home Insurance",
    href: "/products/home-insurance",
    description: "Protect your home and belongings.",
    icon: "home",
  },
];

export const defaultSiteNavigation: SiteNavigationConfig = {
  notification: {
    enabled: true,
    message:
      "Trusted insurance brokerage — protecting individuals & businesses since 1999",
    phone: "0700 652040",
    email: "info@shivinsbro.co.ke",
  },
  header: {
    products: defaultProductNavLinks,
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
        links: defaultProductNavLinks.map(({ label, href }) => ({ label, href })),
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
