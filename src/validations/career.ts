import { z } from "zod";

export const careerApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  coverLetter: z.string().optional(),
});
