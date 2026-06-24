import { z } from "zod";

export const step1Schema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  category: z.string().optional(),
});

export const step2Schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(9, "Valid phone number required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  idNumber: z.string().min(5, "ID number is required"),
  kraPin: z.string().min(5, "KRA PIN is required"),
});

export const step3Schema = z.object({
  factors: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export const step6Schema = z.object({
  termsAccepted: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms to continue",
  }),
});

export const wizardAutosaveSchema = z.object({
  currentStep: z.number().int().min(1).max(8),
  wizardData: z.object({
    insurance: step1Schema.optional(),
    customer: step2Schema.optional(),
    coverage: step3Schema.optional(),
    documents: z
      .object({
        items: z.array(
          z.object({
            id: z.string(),
            fileName: z.string(),
            mimeType: z.string(),
            url: z.string(),
            mediaId: z.string(),
          })
        ),
      })
      .optional(),
    premium: z
      .object({
        result: z.unknown().nullable(),
        calculatedAt: z.string().optional(),
      })
      .optional(),
    review: step6Schema.partial().optional(),
    pdf: z
      .object({
        pdfUrl: z.string().optional(),
        generatedAt: z.string().optional(),
      })
      .optional(),
    payment: z
      .object({
        status: z.enum(["pending", "completed", "skipped"]).optional(),
        checkoutUrl: z.string().optional(),
      })
      .optional(),
  }),
});
