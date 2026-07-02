import { z } from "zod";
import type { ProductType } from "@/generated/prisma/client";

const productTypeValues = [
  "MOTOR",
  "MEDICAL",
  "TRAVEL",
  "LIFE",
  "HOME",
  "BUSINESS",
  "MARINE",
] as const satisfies readonly ProductType[];

export const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  productSlug: z.string().optional(),
  productType: z.enum(productTypeValues).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  message: z.string().optional(),
});

export const SLUG_TO_PRODUCT_TYPE: Record<string, ProductType> = {
  "motor-insurance": "MOTOR",
  "medical-insurance": "MEDICAL",
  "travel-insurance": "TRAVEL",
  "life-insurance": "LIFE",
  "home-insurance": "HOME",
  "business-insurance": "BUSINESS",
  "marine-insurance": "MARINE",
};

export function resolveLeadProductType(
  productSlug?: string,
  productType?: ProductType
): ProductType | undefined {
  if (productType) return productType;
  if (!productSlug) return undefined;
  return SLUG_TO_PRODUCT_TYPE[productSlug];
}
