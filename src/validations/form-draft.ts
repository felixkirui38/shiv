import { z } from "zod";

export const formDraftSessionSchema = z
  .string()
  .min(8, "sessionId must be at least 8 characters")
  .max(128);

export const saveFormDraftSchema = z.object({
  sessionId: formDraftSessionSchema.optional(),
  currentStep: z.number().int().min(1).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const submitPublicFormSchema = z.object({
  sessionId: formDraftSessionSchema.optional(),
  data: z.record(z.string(), z.unknown()),
});

export function mergeDraftPayload(body: z.infer<typeof saveFormDraftSchema>) {
  const values = { ...(body.data ?? {}) };
  if (body.currentStep !== undefined) {
    values.currentStep = body.currentStep;
  }
  return values;
}
