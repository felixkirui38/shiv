export interface HomepageHeroImage {
  id: string;
  label: string;
  imageUrl?: string;
  alt: string;
}

export interface HomepageHero {
  headline: string;
  subheadline: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
  backgroundImageUrl?: string;
  images: HomepageHeroImage[];
}

export interface HomepageFinderOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  productSlug: string;
}

export interface HomepageInsuranceFinder {
  title: string;
  subtitle: string;
  options: HomepageFinderOption[];
}

export interface HomepageProductCard {
  id: string;
  label: string;
  slug: string;
  description: string;
  icon: string;
  enabled: boolean;
  sortOrder: number;
}

export interface HomepageProducts {
  title: string;
  subtitle: string;
  cards: HomepageProductCard[];
}

export interface HomepageStep {
  title: string;
  description: string;
}

export interface HomepageStat {
  value: number;
  suffix: string;
  label: string;
}

export interface HomepageReason {
  title: string;
  description: string;
  icon: string;
}

export interface HomepagePartner {
  name: string;
  logoUrl?: string;
  website?: string;
}

export interface HomepageTestimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface HomepageBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl?: string;
}

export interface HomepageFaq {
  question: string;
  answer: string;
}

export interface HomepageSectionMeta {
  title: string;
  subtitle?: string;
}

export interface HomepageContent {
  hero: HomepageHero;
  insuranceFinder: HomepageInsuranceFinder;
  products: HomepageProducts;
  calculator: HomepageSectionMeta;
  howItWorks: HomepageSectionMeta & { steps: HomepageStep[] };
  claims: HomepageSectionMeta & { steps: HomepageStep[] };
  statistics: HomepageSectionMeta & { stats: HomepageStat[] };
  whyChooseUs: HomepageSectionMeta & { reasons: HomepageReason[] };
  partners: HomepageSectionMeta & { items: HomepagePartner[] };
  testimonials: HomepageSectionMeta & { items: HomepageTestimonial[] };
  blog: HomepageSectionMeta & { posts: HomepageBlogPost[] };
  faq: HomepageSectionMeta & { items: HomepageFaq[] };
  cta: HomepageSectionMeta & {
    primaryButtonLabel: string;
    primaryButtonHref: string;
    secondaryButtonLabel: string;
    secondaryButtonHref: string;
  };
}
