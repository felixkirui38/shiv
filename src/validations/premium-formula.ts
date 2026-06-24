import { z } from "zod";

const conditionOperator = z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in"]);

const formulaStepSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("base"), label: z.string().optional() }),
  z.object({
    type: z.literal("multiply_field"),
    field: z.string(),
    rate: z.number(),
    label: z.string(),
  }),
  z.object({
    type: z.literal("per_unit"),
    field: z.string(),
    amount: z.number(),
    label: z.string(),
  }),
  z.object({
    type: z.literal("percent_of_field"),
    field: z.string(),
    percent: z.number(),
    label: z.string(),
  }),
  z.object({
    type: z.literal("condition"),
    field: z.string(),
    operator: conditionOperator,
    value: z.unknown(),
    multiplier: z.number().optional(),
    fixedAmount: z.number().optional(),
    label: z.string(),
  }),
  z.object({
    type: z.literal("lookup_multiplier"),
    field: z.string(),
    map: z.record(z.string(), z.number()),
    default: z.number().optional(),
    label: z.string(),
  }),
  z.object({
    type: z.literal("lookup_add"),
    field: z.string(),
    map: z.record(z.string(), z.number()),
    default: z.number().optional(),
    label: z.string(),
  }),
  z.object({
    type: z.literal("discount_per_unit"),
    field: z.string(),
    ratePerUnit: z.number(),
    maxUnits: z.number(),
    label: z.string(),
  }),
  z.object({ type: z.literal("floor"), value: z.number() }),
  z.object({ type: z.literal("ceil"), value: z.number() }),
]);

export const calculatorFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["number", "select", "text"]),
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  helpText: z.string().optional(),
});

export const formulaDefinitionSchema = z.object({
  steps: z.array(formulaStepSchema),
});

export const updateFormulaVersionSchema = z.object({
  name: z.string().optional(),
  changelog: z.string().optional(),
  basePremium: z.number().min(0).optional(),
  formula: formulaDefinitionSchema.optional(),
  fields: z.array(calculatorFieldSchema).optional(),
});

export const calculateInputSchema = z.object({
  factors: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()])
  ),
  versionId: z.string().optional(),
});

export const createDraftSchema = z.object({
  changelog: z.string().optional(),
});
