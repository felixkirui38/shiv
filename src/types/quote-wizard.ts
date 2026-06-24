import type { PremiumCalculationResult } from "@/lib/premium-engine/types";

export const WIZARD_STEPS = [
  { id: 1, key: "insurance", title: "Insurance Type", description: "Choose your coverage" },
  { id: 2, key: "customer", title: "Your Details", description: "Personal information" },
  { id: 3, key: "coverage", title: "Coverage Options", description: "Tailor your cover" },
  { id: 4, key: "documents", title: "Documents", description: "Upload supporting files" },
  { id: 5, key: "premium", title: "Premium", description: "Calculate your premium" },
  { id: 6, key: "review", title: "Review", description: "Confirm your quote" },
  { id: 7, key: "pdf", title: "Quote PDF", description: "Download your quote" },
  { id: 8, key: "payment", title: "Payment", description: "Secure checkout" },
] as const;

export const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length;

export interface WizardStep1Insurance {
  productId: string;
  productSlug: string;
  productName: string;
  category?: string;
}

export interface WizardStep2Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  idNumber: string;
  kraPin: string;
}

export interface WizardStep3Coverage {
  factors: Record<string, string | number | boolean>;
}

export interface WizardDocument {
  id: string;
  fileName: string;
  mimeType: string;
  url: string;
  mediaId: string;
}

export interface WizardStep4Documents {
  items: WizardDocument[];
}

export interface WizardStep5Premium {
  result: PremiumCalculationResult | null;
  calculatedAt?: string;
}

export interface WizardStep6Review {
  termsAccepted: boolean;
}

export interface WizardStep7Pdf {
  pdfUrl?: string;
  generatedAt?: string;
}

export interface WizardStep8Payment {
  status?: "pending" | "completed" | "skipped" | "processing";
  checkoutUrl?: string;
  provider?: "STRIPE" | "PESAPAL" | "FLUTTERWAVE" | "MPESA";
  planType?: "ONE_TIME" | "SUBSCRIPTION" | "INSTALLMENT" | "ANNUAL";
  installmentCount?: number;
  message?: string;
}

export interface QuoteWizardData {
  insurance?: WizardStep1Insurance;
  customer?: WizardStep2Customer;
  coverage?: WizardStep3Coverage;
  documents?: WizardStep4Documents;
  premium?: WizardStep5Premium;
  review?: WizardStep6Review;
  pdf?: WizardStep7Pdf;
  payment?: WizardStep8Payment;
}

export interface QuoteWizardState {
  id: string;
  quoteNumber: string;
  resumeToken: string;
  currentStep: number;
  status: string;
  wizardData: QuoteWizardData;
  estimatedPremium: number;
  pdfUrl: string | null;
  product: {
    id: string;
    slug: string;
    name: string;
    category: string | null;
  } | null;
}

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const;

export const MAX_DOCUMENT_SIZE_MB = 10;
