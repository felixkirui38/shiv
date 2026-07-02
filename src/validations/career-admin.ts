import { z } from "zod";

export const updateCareerApplicationSchema = z.object({
  status: z.enum(["pending", "reviewing", "shortlisted", "rejected", "hired"]).optional(),
});
