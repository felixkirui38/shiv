import type { HomepageContent } from "@/types/homepage";

export const defaultHomepageContent: HomepageContent = {
  hero: {
    headline: "Protecting Your Future Starts Today",
    subheadline:
      "Insurance solutions designed for individuals, families and businesses.",
    primaryButtonLabel: "Purchase Insurance",
    primaryButtonHref: "/products",
    secondaryButtonLabel: "Learn More",
    secondaryButtonHref: "/about",
    images: [
      {
        id: "business",
        label: "Business Professionals",
        alt: "Business professionals protected by insurance",
      },
      {
        id: "family",
        label: "Family Protection",
        alt: "Family protection and peace of mind",
      },
      {
        id: "vehicle",
        label: "Vehicle Insurance",
        alt: "Comprehensive vehicle insurance coverage",
      },
    ],
  },
  insuranceFinder: {
    title: "Find the Right Insurance",
    subtitle:
      "Tell us what you need to protect and we'll guide you to the right coverage.",
    options: [
      {
        id: "vehicle",
        label: "My Vehicle",
        description: "Cars, fleets and commercial vehicles",
        icon: "car",
        productSlug: "motor-insurance",
      },
      {
        id: "health",
        label: "My Health",
        description: "Medical cover for you and your family",
        icon: "heart",
        productSlug: "medical-insurance",
      },
      {
        id: "family",
        label: "My Family",
        description: "Life cover and financial security",
        icon: "shield",
        productSlug: "life-insurance",
      },
      {
        id: "travel",
        label: "My Travels",
        description: "Domestic and international travel",
        icon: "plane",
        productSlug: "travel-insurance",
      },
      {
        id: "home",
        label: "My Home",
        description: "Property and contents protection",
        icon: "home",
        productSlug: "home-insurance",
      },
      {
        id: "business",
        label: "My Business",
        description: "Commercial liability and assets",
        icon: "building",
        productSlug: "business-insurance",
      },
    ],
  },
  products: {
    title: "Our Insurance Products",
    subtitle:
      "Comprehensive coverage across eight product lines — tailored to your needs.",
    cards: [
      {
        id: "motor",
        label: "Motor",
        slug: "motor-insurance",
        description: "Vehicle protection against accidents, theft and liability.",
        icon: "car",
        enabled: true,
        sortOrder: 0,
      },
      {
        id: "medical",
        label: "Medical",
        slug: "medical-insurance",
        description: "Health coverage for individuals, families and groups.",
        icon: "heart",
        enabled: true,
        sortOrder: 1,
      },
      {
        id: "life",
        label: "Life",
        slug: "life-insurance",
        description: "Financial security for your loved ones.",
        icon: "shield",
        enabled: true,
        sortOrder: 2,
      },
      {
        id: "travel",
        label: "Travel",
        slug: "travel-insurance",
        description: "Protection for domestic and international travel.",
        icon: "plane",
        enabled: true,
        sortOrder: 3,
      },
      {
        id: "business",
        label: "Business",
        slug: "business-insurance",
        description: "Commercial liability, property and interruption cover.",
        icon: "building",
        enabled: true,
        sortOrder: 4,
      },
      {
        id: "marine",
        label: "Marine",
        slug: "marine-insurance",
        description: "Cargo, hull and freight transit insurance.",
        icon: "ship",
        enabled: true,
        sortOrder: 5,
      },
      {
        id: "pet",
        label: "Pet",
        slug: "pet-insurance",
        description: "Veterinary care for your beloved pets.",
        icon: "paw",
        enabled: true,
        sortOrder: 6,
      },
      {
        id: "home",
        label: "Home",
        slug: "home-insurance",
        description: "Protect your home and belongings.",
        icon: "home",
        enabled: true,
        sortOrder: 7,
      },
    ],
  },
  calculator: {
    title: "Coverage Calculator",
    subtitle:
      "Get an instant premium estimate based on your coverage needs.",
  },
  howItWorks: {
    title: "How It Works",
    subtitle: "Getting insured with Shiv Insurance is simple and transparent.",
    steps: [
      {
        title: "Request a Quote",
        description:
          "Share your insurance needs online or speak with our advisors.",
      },
      {
        title: "Compare Options",
        description:
          "We present tailored plans from Kenya's leading underwriters.",
      },
      {
        title: "Get Covered",
        description:
          "Choose your plan, complete payment, and receive your policy documents.",
      },
      {
        title: "Ongoing Support",
        description:
          "Renewals, claims assistance, and advisory support throughout your policy.",
      },
    ],
  },
  claims: {
    title: "Claims Process",
    subtitle:
      "A straightforward process designed to resolve your claim quickly and fairly.",
    steps: [
      {
        title: "Report",
        description: "Notify us of your claim via portal, phone or email.",
      },
      {
        title: "Document",
        description: "Submit required supporting documents and evidence.",
      },
      {
        title: "Assess",
        description: "Our team reviews and coordinates with the underwriter.",
      },
      {
        title: "Settle",
        description: "Approved claims are settled promptly and transparently.",
      },
    ],
  },
  statistics: {
    title: "Trusted Across Kenya",
    subtitle: "Numbers that reflect our commitment to excellence.",
    stats: [
      { value: 25, suffix: "+", label: "Years of Service" },
      { value: 10000, suffix: "+", label: "Policies Managed" },
      { value: 5000, suffix: "+", label: "Claims Processed" },
      { value: 98, suffix: "%", label: "Client Satisfaction" },
    ],
  },
  whyChooseUs: {
    title: "Why Choose Shiv Insurance",
    subtitle:
      "A licensed brokerage committed to protecting what matters most.",
    reasons: [
      {
        title: "Licensed & Regulated",
        description:
          "Fully licensed by the Insurance Regulatory Authority (IRA/06/267/2024).",
        icon: "badge",
      },
      {
        title: "Expert Advisory",
        description:
          "Dedicated advisors who understand your risks and recommend the right cover.",
        icon: "users",
      },
      {
        title: "Leading Underwriters",
        description:
          "Access to policies from Kenya's most trusted insurance companies.",
        icon: "building",
      },
      {
        title: "Claims Advocacy",
        description:
          "We represent your interests throughout the entire claims process.",
        icon: "shield",
      },
      {
        title: "Competitive Premiums",
        description:
          "We negotiate the best rates without compromising on coverage quality.",
        icon: "chart",
      },
      {
        title: "Personalised Service",
        description:
          "Tailored solutions for individuals, families and corporate clients.",
        icon: "heart",
      },
    ],
  },
  partners: {
    title: "Our Insurance Partners",
    subtitle: "Underwritten by Kenya's leading insurance companies.",
    items: [
      { name: "APA Insurance" },
      { name: "Britam" },
      { name: "CIC Insurance" },
      { name: "Jubilee" },
      { name: "Kenindia" },
      { name: "Madison" },
      { name: "UAP Old Mutual" },
      { name: "Sanlam" },
    ],
  },
  testimonials: {
    title: "What Our Clients Say",
    subtitle: "Trusted by thousands of individuals and businesses.",
    items: [
      {
        name: "James Mwangi",
        role: "Business Owner",
        content:
          "Shiv Insurance provided exceptional service setting up our corporate medical scheme. Their expertise is unmatched.",
        rating: 5,
      },
      {
        name: "Sarah Wanjiku",
        role: "Fleet Manager",
        content:
          "We've managed our motor fleet through Shiv for over five years. Claims are handled professionally every time.",
        rating: 5,
      },
      {
        name: "David Ochieng",
        role: "Homeowner",
        content:
          "When we had a fire incident, the claims team guided us through every step. Settlement was fair and prompt.",
        rating: 5,
      },
    ],
  },
  blog: {
    title: "Recent Articles",
    subtitle: "Insurance insights and expert advice from our team.",
    posts: [
      {
        slug: "understanding-motor-insurance",
        title: "Understanding Motor Insurance in Kenya",
        excerpt:
          "A guide to third-party and comprehensive motor cover requirements.",
        category: "Motor",
        date: "Mar 15, 2026",
      },
      {
        slug: "medical-scheme-benefits",
        title: "Choosing the Right Medical Scheme",
        excerpt:
          "Key factors when selecting group medical insurance for employees.",
        category: "Medical",
        date: "Mar 8, 2026",
      },
      {
        slug: "claims-tips",
        title: "5 Tips for a Smooth Claims Experience",
        excerpt:
          "How to prepare documentation for a hassle-free claims process.",
        category: "Claims",
        date: "Feb 28, 2026",
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Answers to common questions about our products and services.",
    items: [
      {
        question: "What types of insurance does Shiv Insurance offer?",
        answer:
          "We offer motor, medical, travel, life, home, business, marine, and pet insurance through leading underwriters.",
      },
      {
        question: "How do I file an insurance claim?",
        answer:
          "Claims can be filed through our client portal, by phone, or via email. Our team will guide you through documentation.",
      },
      {
        question: "How long does claim processing take?",
        answer:
          "Most claims are processed within 5–10 business days depending on complexity and documentation.",
      },
      {
        question: "Can I pay premiums in instalments?",
        answer:
          "Yes, we offer monthly, quarterly, and annual payment schedules for most products.",
      },
      {
        question: "Is Shiv Insurance Brokers licensed?",
        answer:
          "Yes, we are fully licensed and regulated by the IRA (IRA/06/267/2024).",
      },
    ],
  },
  cta: {
    title: "Ready to Protect What Matters?",
    subtitle:
      "Purchase insurance cover online in minutes with Shiv Insurance Brokers.",
    primaryButtonLabel: "Purchase Insurance",
    primaryButtonHref: "/products",
    secondaryButtonLabel: "Contact Us",
    secondaryButtonHref: "/contact",
  },
};
