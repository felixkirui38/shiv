import type { InsuranceApplicationStatus, OrderStatus } from "@/generated/prisma/client";
import type { PremiumCalculationResult } from "@/lib/premium-engine/types";

export const PURCHASE_STEPS = [
  { step: 1, label: "Application", description: "Complete your insurance application" },
  { step: 2, label: "Premium", description: "Review calculated premium" },
  { step: 3, label: "Review", description: "Confirm application details" },
  { step: 4, label: "Checkout", description: "Pay and receive your policy" },
] as const;

export const TOTAL_PURCHASE_STEPS = PURCHASE_STEPS.length;

export interface PremiumBreakdown {
  basicPremium: number;
  levies: number;
  taxes: number;
  stampDuty: number;
  totalPremium: number;
  adjustments?: PremiumCalculationResult["adjustments"];
}

export interface PurchaseApplicationState {
  id: string;
  applicationNumber: string;
  resumeToken: string;
  currentStep: number;
  status: InsuranceApplicationStatus;
  formData: Record<string, unknown>;
  premiumBreakdown: PremiumBreakdown | null;
  totalPremium: number;
  product: {
    id: string;
    slug: string;
    name: string;
    category: string | null;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
  } | null;
}

export interface CmsFormField {
  id: string;
  key: string;
  label: string;
  type: string;
  placeholder?: string | null;
  helpText?: string | null;
  isRequired: boolean;
  sortOrder: number;
  options?: unknown;
  validation?: { section?: string } | null;
  defaultValue?: string | null;
}

export interface CmsFormDefinition {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  settings?: { sections?: { id: string; title: string }[] } | null;
  fields: CmsFormField[];
}
