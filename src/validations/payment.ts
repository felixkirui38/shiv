import { z } from "zod";

export const checkoutSchema = z.object({
  provider: z.enum(["STRIPE", "PESAPAL", "FLUTTERWAVE", "MPESA"]),
  planType: z
    .enum(["ONE_TIME", "SUBSCRIPTION", "INSTALLMENT", "ANNUAL"])
    .default("ONE_TIME"),
  amount: z.number().positive(),
  currency: z.string().default("KES"),
  description: z.string().optional(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  quoteId: z.string().optional(),
  policyId: z.string().optional(),
  invoiceId: z.string().optional(),
  installmentCount: z.number().int().min(2).max(12).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const refundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});
