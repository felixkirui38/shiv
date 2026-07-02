import { z } from "zod";

const userStatusValues = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"] as const;

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(userStatusValues).optional(),
});
