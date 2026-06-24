import type { PrismaClient } from "@/generated/prisma/client";
import type { CreateProductInput } from "@/validations/product";

interface ProductSeedData extends Partial<CreateProductInput> {
  name: string;
  slug: string;
  premiumRules?: {
    name: string;
    fieldKey: string;
    operator: string;
    value: unknown;
    multiplier?: number;
    fixedAmount?: number;
    priority?: number;
  }[];
}

export const defaultProductsSeed: ProductSeedData[] = [
  {
    name: "Motor Insurance",
    slug: "motor-insurance",
    category: "motor",
    icon: "car",
    shortDescription:
      "Comprehensive vehicle protection against accidents, theft, and third-party liability.",
    longDescription:
      "Our motor insurance policies provide extensive coverage for private vehicles, commercial fleets, and motorcycles. Whether you need third-party or comprehensive cover, Shiv Insurance Brokers connects you with Kenya's leading underwriters at competitive rates.",
    basePremium: 1200,
    pricingFormula: { coverageBase: 100000, coverageRate: 1, deductibleRate: 0.05 },
    claimProcedure:
      "1. Report the incident immediately via phone or client portal.\n2. Submit police abstract (if applicable) and repair estimates.\n3. Our claims team assesses and coordinates with the underwriter.\n4. Approved claims are settled per policy terms.",
    terms:
      "Coverage is subject to policy limits, exclusions, and conditions as stated in the schedule. Premium must be paid before cover commences.",
    metaTitle: "Motor Insurance Kenya | Shiv Insurance Brokers",
    metaDescription:
      "Get motor insurance quotes for comprehensive and third-party vehicle cover in Kenya.",
    benefits: [
      { title: "Third-party liability", description: "Bodily injury and property damage cover", sortOrder: 0 },
      { title: "Comprehensive options", description: "Accident, theft, fire and natural calamities", sortOrder: 1 },
      { title: "Roadside assistance", description: "Optional add-on for breakdown support", sortOrder: 2 },
    ],
    coverages: [
      { name: "Third Party Liability", description: "Legal liability to third parties", limit: 5000000, sortOrder: 0 },
      { name: "Own Damage", description: "Accident and collision damage", isIncluded: true, sortOrder: 1 },
      { name: "Theft & Fire", description: "Vehicle theft and fire damage", isIncluded: true, sortOrder: 2 },
    ],
    exclusions: [
      { title: "Driving under influence", description: "Claims arising from DUI incidents", sortOrder: 0 },
      { title: "Unlicensed drivers", description: "Incidents involving unlicensed operators", sortOrder: 1 },
    ],
    eligibilityItems: [
      { title: "Valid driving licence", description: "Insured must hold a valid Kenyan driving licence", sortOrder: 0 },
      { title: "Roadworthy vehicle", description: "Vehicle must pass inspection requirements", sortOrder: 1 },
    ],
    requiredDocuments: [
      { name: "Logbook copy", isRequired: true, sortOrder: 0 },
      { name: "National ID", isRequired: true, sortOrder: 1 },
      { name: "KRA PIN", isRequired: true, sortOrder: 2 },
    ],
    faqs: [
      { question: "What is the difference between TPO and comprehensive?", answer: "Third-party only covers damage to others. Comprehensive covers your vehicle plus third-party liability.", sortOrder: 0 },
      { question: "Can I pay premiums monthly?", answer: "Yes, monthly instalment options are available for most motor policies.", sortOrder: 1 },
    ],
    premiumRules: [
      { name: "Clean driving record discount", fieldKey: "drivingRecord", operator: "eq", value: { operator: "eq", value: "clean" }, multiplier: 0.9, priority: 10 },
    ],
    sortOrder: 0,
  },
  {
    name: "Medical Insurance",
    slug: "medical-insurance",
    category: "medical",
    icon: "heart",
    shortDescription: "Health coverage for individuals, families, and corporate groups.",
    longDescription:
      "Access quality healthcare through our medical insurance schemes. We design individual, family, and corporate medical covers with inpatient, outpatient, and maternity benefits.",
    basePremium: 2400,
    pricingFormula: { coverageBase: 100000, coverageRate: 1.2, deductibleRate: 0.03 },
    claimProcedure: "Present membership card at network hospital. For reimbursements, submit claim form with receipts within 30 days.",
    terms: "Pre-existing conditions may be subject to waiting periods as per underwriter terms.",
    benefits: [
      { title: "Inpatient cover", description: "Hospital admission and surgical costs", sortOrder: 0 },
      { title: "Outpatient benefits", description: "Consultations, diagnostics and pharmacy", sortOrder: 1 },
      { title: "Maternity cover", description: "Optional maternity and newborn care", sortOrder: 2 },
    ],
    coverages: [
      { name: "Inpatient", limit: 2000000, sortOrder: 0 },
      { name: "Outpatient", limit: 150000, sortOrder: 1 },
    ],
    exclusions: [{ title: "Cosmetic procedures", description: "Elective cosmetic treatments", sortOrder: 0 }],
    eligibilityItems: [{ title: "Age limits", description: "Entry age typically 18–65 years", sortOrder: 0 }],
    requiredDocuments: [{ name: "National ID", isRequired: true, sortOrder: 0 }],
    faqs: [{ question: "Does it cover pre-existing conditions?", answer: "Coverage depends on the scheme. Some conditions have waiting periods.", sortOrder: 0 }],
    sortOrder: 1,
  },
  {
    name: "Travel Insurance",
    slug: "travel-insurance",
    category: "travel",
    icon: "plane",
    shortDescription: "Protection for domestic and international travel.",
    longDescription: "Travel with confidence. Our travel insurance covers medical emergencies abroad, trip cancellation, lost baggage, and personal liability.",
    basePremium: 150,
    pricingFormula: { coverageBase: 50000, coverageRate: 1 },
    claimProcedure: "Contact our 24/7 emergency helpline immediately. Retain all receipts and medical reports.",
    terms: "Cover is valid for the specified travel dates and destinations only.",
    benefits: [
      { title: "Medical emergencies", description: "Emergency treatment abroad", sortOrder: 0 },
      { title: "Trip cancellation", description: "Reimbursement for cancelled trips", sortOrder: 1 },
    ],
    coverages: [{ name: "Emergency Medical", limit: 5000000, sortOrder: 0 }],
    exclusions: [{ title: "High-risk activities", description: "Extreme sports unless add-on purchased", sortOrder: 0 }],
    eligibilityItems: [{ title: "Valid passport", description: "Required for international travel cover", sortOrder: 0 }],
    requiredDocuments: [{ name: "Travel itinerary", isRequired: true, sortOrder: 0 }],
    faqs: [{ question: "Is Schengen visa cover included?", answer: "Yes, we offer Schengen-compliant travel insurance certificates.", sortOrder: 0 }],
    sortOrder: 2,
  },
  {
    name: "Life Insurance",
    slug: "life-insurance",
    category: "life",
    icon: "shield",
    shortDescription: "Financial security for your loved ones.",
    longDescription: "Protect your family's financial future with term life, whole life, and endowment policies tailored to your goals.",
    basePremium: 500,
    pricingFormula: { coverageBase: 1000000, coverageRate: 1 },
    claimProcedure: "Beneficiary submits death certificate, policy documents, and claim form. Assessment within 10 business days.",
    terms: "Suicide clause and contestability period apply as per policy wording.",
    benefits: [
      { title: "Death benefit", description: "Lump sum to beneficiaries", sortOrder: 0 },
      { title: "Optional riders", description: "Critical illness and disability riders", sortOrder: 1 },
    ],
    coverages: [{ name: "Death Benefit", limit: 10000000, sortOrder: 0 }],
    exclusions: [{ title: "War and terrorism", description: "Death from war in excluded territories", sortOrder: 0 }],
    eligibilityItems: [{ title: "Medical underwriting", description: "May require medical examination", sortOrder: 0 }],
    requiredDocuments: [{ name: "Beneficiary nomination form", isRequired: true, sortOrder: 0 }],
    faqs: [{ question: "What is term vs whole life?", answer: "Term covers a fixed period; whole life provides lifetime cover with cash value.", sortOrder: 0 }],
    sortOrder: 3,
  },
  {
    name: "Business Insurance",
    slug: "business-insurance",
    category: "business",
    icon: "building",
    shortDescription: "Commercial liability, property, and business interruption cover.",
    longDescription: "Comprehensive commercial insurance for SMEs and corporates including public liability, employer liability, property, and business interruption.",
    basePremium: 3500,
    pricingFormula: { coverageBase: 500000, coverageRate: 1.5 },
    claimProcedure: "Report incident to us within 48 hours. Submit incident report, photos, and financial records as required.",
    terms: "Coverage limits apply per occurrence and in aggregate.",
    benefits: [
      { title: "Public liability", description: "Third-party injury on premises", sortOrder: 0 },
      { title: "Property cover", description: "Buildings, stock and equipment", sortOrder: 1 },
    ],
    coverages: [{ name: "Public Liability", limit: 10000000, sortOrder: 0 }],
    exclusions: [{ title: "Professional indemnity", description: "Requires separate PI policy", sortOrder: 0 }],
    eligibilityItems: [{ title: "Registered business", description: "Valid business registration required", sortOrder: 0 }],
    requiredDocuments: [{ name: "Certificate of incorporation", isRequired: true, sortOrder: 0 }],
    faqs: [{ question: "Do you cover home-based businesses?", answer: "Yes, with appropriate business use disclosure.", sortOrder: 0 }],
    sortOrder: 4,
  },
  {
    name: "Marine Insurance",
    slug: "marine-insurance",
    category: "marine",
    icon: "ship",
    shortDescription: "Cargo, hull, and freight transit insurance.",
    longDescription: "Marine cargo and hull insurance for importers, exporters, and shipping operators across sea, air, and land transit.",
    basePremium: 5000,
    pricingFormula: { coverageBase: 1000000, coverageRate: 0.8 },
    claimProcedure: "Notify us immediately upon loss discovery. Submit survey report, bill of lading, and commercial invoice.",
    terms: "Subject to Institute Cargo Clauses (A/B/C) as selected.",
    benefits: [
      { title: "All-risk cargo", description: "Comprehensive transit protection", sortOrder: 0 },
      { title: "War & SRCC", description: "Optional war and strikes cover", sortOrder: 1 },
    ],
    coverages: [{ name: "Cargo All Risk", limit: 50000000, sortOrder: 0 }],
    exclusions: [{ title: "Inherent vice", description: "Natural deterioration of goods", sortOrder: 0 }],
    eligibilityItems: [{ title: "Proper packaging", description: "Goods must be suitably packed for transit", sortOrder: 0 }],
    requiredDocuments: [{ name: "Bill of lading", isRequired: true, sortOrder: 0 }],
    faqs: [{ question: "Is inland transit covered?", answer: "Yes, from warehouse to port and final destination.", sortOrder: 0 }],
    sortOrder: 5,
  },
  {
    name: "Home Insurance",
    slug: "home-insurance",
    category: "home",
    icon: "home",
    shortDescription: "Protect your home and belongings.",
    longDescription: "Home insurance covering building structure, contents, and personal liability for homeowners and tenants.",
    basePremium: 800,
    pricingFormula: { coverageBase: 2000000, coverageRate: 1 },
    claimProcedure: "Report damage immediately. Do not dispose of damaged items until assessed. Submit photos and repair quotes.",
    terms: "Unoccupancy clauses may apply after 60 consecutive days.",
    benefits: [
      { title: "Building cover", description: "Structure against fire, flood, theft", sortOrder: 0 },
      { title: "Contents cover", description: "Furniture, electronics and valuables", sortOrder: 1 },
    ],
    coverages: [
      { name: "Building", limit: 10000000, sortOrder: 0 },
      { name: "Contents", limit: 2000000, sortOrder: 1 },
    ],
    exclusions: [{ title: "Wear and tear", description: "Gradual deterioration excluded", sortOrder: 0 }],
    eligibilityItems: [{ title: "Property ownership", description: "Owner or tenant with insurable interest", sortOrder: 0 }],
    requiredDocuments: [{ name: "Valuation report", isRequired: false, sortOrder: 0 }],
    faqs: [{ question: "Are domestic workers covered?", answer: "Employer liability extension available as add-on.", sortOrder: 0 }],
    sortOrder: 6,
  },
  {
    name: "Pet Insurance",
    slug: "pet-insurance",
    category: "pet",
    icon: "paw",
    shortDescription: "Veterinary care coverage for your pets.",
    longDescription: "Pet insurance covering accidents, illnesses, and optional wellness care for dogs and cats.",
    basePremium: 350,
    pricingFormula: { coverageBase: 50000, coverageRate: 1 },
    claimProcedure: "Visit any licensed vet. Submit claim form with invoices within 14 days of treatment.",
    terms: "Age limits and breed restrictions may apply.",
    benefits: [
      { title: "Accident cover", description: "Emergency veterinary treatment", sortOrder: 0 },
      { title: "Illness cover", description: "Diagnostic and treatment costs", sortOrder: 1 },
    ],
    coverages: [{ name: "Veterinary Fees", limit: 200000, sortOrder: 0 }],
    exclusions: [{ title: "Pre-existing conditions", description: "Conditions before policy start", sortOrder: 0 }],
    eligibilityItems: [{ title: "Pet age", description: "Typically 8 weeks to 8 years at entry", sortOrder: 0 }],
    requiredDocuments: [{ name: "Vaccination records", isRequired: true, sortOrder: 0 }],
    faqs: [{ question: "Which pets are covered?", answer: "Dogs and cats. Exotic pets on referral.", sortOrder: 0 }],
    sortOrder: 7,
  },
];

export async function seedProducts(prisma: PrismaClient) {
  for (const data of defaultProductsSeed) {
    const { premiumRules, benefits, coverages, exclusions, eligibilityItems, requiredDocuments, faqs, ...product } = data;

    const created = await prisma.insuranceProduct.upsert({
      where: { slug: product.slug },
      update: {
        ...product,
        pricingFormula: product.pricingFormula ?? undefined,
      },
      create: {
        ...product,
        pricingFormula: product.pricingFormula ?? undefined,
      },
    });

    await prisma.productBenefit.deleteMany({ where: { productId: created.id } });
    await prisma.productCoverage.deleteMany({ where: { productId: created.id } });
    await prisma.productExclusion.deleteMany({ where: { productId: created.id } });
    await prisma.productEligibility.deleteMany({ where: { productId: created.id } });
    await prisma.productRequiredDocument.deleteMany({ where: { productId: created.id } });
    await prisma.productFaq.deleteMany({ where: { productId: created.id } });
    await prisma.premiumRule.deleteMany({ where: { productId: created.id } });

    if (benefits?.length) {
      await prisma.productBenefit.createMany({
        data: benefits.map((b) => ({ ...b, productId: created.id })),
      });
    }
    if (coverages?.length) {
      await prisma.productCoverage.createMany({
        data: coverages.map((c) => ({
          productId: created.id,
          name: c.name,
          description: c.description,
          limit: c.limit,
          deductible: c.deductible,
          isIncluded: c.isIncluded ?? true,
          sortOrder: c.sortOrder,
        })),
      });
    }
    if (exclusions?.length) {
      await prisma.productExclusion.createMany({
        data: exclusions.map((e) => ({ ...e, productId: created.id })),
      });
    }
    if (eligibilityItems?.length) {
      await prisma.productEligibility.createMany({
        data: eligibilityItems.map((e) => ({ ...e, productId: created.id })),
      });
    }
    if (requiredDocuments?.length) {
      await prisma.productRequiredDocument.createMany({
        data: requiredDocuments.map((d) => ({ ...d, productId: created.id })),
      });
    }
    if (faqs?.length) {
      await prisma.productFaq.createMany({
        data: faqs.map((f) => ({ ...f, productId: created.id })),
      });
    }
    if (premiumRules?.length) {
      await prisma.premiumRule.createMany({
        data: premiumRules.map((r) => ({
          productId: created.id,
          name: r.name,
          fieldKey: r.fieldKey,
          operator: r.operator,
          value: r.value as object,
          multiplier: r.multiplier ?? 1,
          fixedAmount: r.fixedAmount ?? 0,
          priority: r.priority ?? 0,
        })),
      });
    }
  }
}
