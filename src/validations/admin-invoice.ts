import { z } from "zod";

const invoiceStatusValues = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "VOID"] as const;

export const updateInvoiceSchema = z.object({
  status: z.enum(invoiceStatusValues).optional(),
  notes: z.string().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});
