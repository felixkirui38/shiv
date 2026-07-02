import { z } from "zod";

const leadStatusValues = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const;

export const updateLeadSchema = z.object({
  status: z.enum(leadStatusValues).optional(),
  notes: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
});
