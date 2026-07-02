import { z } from "zod";

const formFieldTypes = [
  "TEXT",
  "TEXTAREA",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "SELECT",
  "MULTI_SELECT",
  "RADIO",
  "CHECKBOX",
  "FILE",
  "BOOLEAN",
  "ADDRESS",
  "CURRENCY",
] as const;

export const formDefinitionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  productId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const formFieldSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Key must start with a letter and use letters, numbers, or underscores"),
  label: z.string().min(1, "Label is required"),
  type: z.enum(formFieldTypes),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  isRequired: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .optional(),
  section: z.string().optional(),
  defaultValue: z.string().optional(),
});

export const FORM_FIELD_TYPE_OPTIONS = formFieldTypes.map((type) => ({
  value: type,
  label: type.replace(/_/g, " "),
}));
