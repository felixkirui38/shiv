import { z } from "zod";

const listItem = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

const coverageItem = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  limit: z.number().optional(),
  deductible: z.number().optional(),
  isIncluded: z.boolean().optional(),
  sortOrder: z.number().int().default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  category: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  icon: z.string().optional(),
  basePremium: z.number().min(0).default(0),
  pricingFormula: z
    .object({
      coverageBase: z.number().optional(),
      coverageRate: z.number().optional(),
      deductibleRate: z.number().optional(),
    })
    .optional(),
  claimProcedure: z.string().optional(),
  terms: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  benefits: z.array(listItem).default([]),
  coverages: z.array(coverageItem).default([]),
  exclusions: z.array(listItem).default([]),
  eligibilityItems: z.array(listItem).default([]),
  requiredDocuments: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        isRequired: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      })
    )
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
        sortOrder: z.number().int().default(0),
      })
    )
    .default([]),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
