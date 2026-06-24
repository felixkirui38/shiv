import type {
  CalculatorField,
  ConditionOperator,
  FormulaStep,
  PremiumCalculationInput,
  PremiumCalculationResult,
  PremiumFormulaDefinition,
} from "@/lib/premium-engine/types";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function matchesCondition(
  fieldValue: unknown,
  operator: ConditionOperator,
  expected: unknown
): boolean {
  switch (operator) {
    case "eq":
      return fieldValue === expected;
    case "neq":
      return fieldValue !== expected;
    case "gt":
      return Number(fieldValue) > Number(expected);
    case "gte":
      return Number(fieldValue) >= Number(expected);
    case "lt":
      return Number(fieldValue) < Number(expected);
    case "lte":
      return Number(fieldValue) <= Number(expected);
    case "in":
      return Array.isArray(expected) && expected.includes(fieldValue);
    default:
      return false;
  }
}

function getNumericField(
  factors: Record<string, string | number | boolean>,
  field: string
): number {
  const v = factors[field];
  return typeof v === "number" ? v : Number(v) || 0;
}

export function validateCalculatorInput(
  fields: CalculatorField[],
  input: PremiumCalculationInput
): string | null {
  for (const field of fields) {
    const value = input.factors[field.key];
    if (field.required && (value === undefined || value === "")) {
      return `${field.label} is required`;
    }
    if (field.type === "number" && value !== undefined && value !== "") {
      const num = Number(value);
      if (Number.isNaN(num)) return `${field.label} must be a number`;
      if (field.min !== undefined && num < field.min) {
        return `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && num > field.max) {
        return `${field.label} must be at most ${field.max}`;
      }
    }
    if (field.type === "select" && value && field.options) {
      const valid = field.options.some((o) => o.value === value);
      if (!valid) return `${field.label} has an invalid value`;
    }
  }
  return null;
}

export function evaluateFormula(
  basePremium: number,
  formula: PremiumFormulaDefinition,
  input: PremiumCalculationInput
): PremiumCalculationResult {
  const { factors } = input;
  const adjustments: PremiumCalculationResult["adjustments"] = [];
  let totalPremium = basePremium;
  let baseSet = false;

  for (const step of formula.steps) {
    const before = totalPremium;

    switch (step.type) {
      case "base":
        totalPremium = basePremium;
        baseSet = true;
        adjustments.push({
          name: step.label ?? "Base premium",
          amount: round2(totalPremium - before),
          stepType: step.type,
        });
        break;

      case "multiply_field": {
        const val = getNumericField(factors, step.field);
        const amount = val * step.rate;
        totalPremium += amount;
        adjustments.push({ name: step.label, amount: round2(amount), stepType: step.type });
        break;
      }

      case "per_unit": {
        const units = getNumericField(factors, step.field);
        const amount = units * step.amount;
        totalPremium += amount;
        adjustments.push({ name: step.label, amount: round2(amount), stepType: step.type });
        break;
      }

      case "percent_of_field": {
        const val = getNumericField(factors, step.field);
        const amount = val * (step.percent / 100);
        totalPremium += amount;
        adjustments.push({ name: step.label, amount: round2(amount), stepType: step.type });
        break;
      }

      case "condition": {
        const fieldValue = factors[step.field];
        if (matchesCondition(fieldValue, step.operator, step.value)) {
          let amount = 0;
          if (step.multiplier !== undefined) {
            amount = totalPremium * (step.multiplier - 1);
          }
          if (step.fixedAmount !== undefined) {
            amount += step.fixedAmount;
          }
          totalPremium += amount;
          adjustments.push({ name: step.label, amount: round2(amount), stepType: step.type });
        }
        break;
      }

      case "lookup_multiplier": {
        const key = String(factors[step.field] ?? "");
        const mult = step.map[key] ?? step.default ?? 1;
        const amount = totalPremium * (mult - 1);
        totalPremium += amount;
        adjustments.push({ name: step.label, amount: round2(amount), stepType: step.type });
        break;
      }

      case "lookup_add": {
        const key = String(factors[step.field] ?? "");
        const amount = step.map[key] ?? step.default ?? 0;
        totalPremium += amount;
        adjustments.push({ name: step.label, amount: round2(amount), stepType: step.type });
        break;
      }

      case "discount_per_unit": {
        const units = Math.min(
          getNumericField(factors, step.field),
          step.maxUnits
        );
        const discount = totalPremium * step.ratePerUnit * units;
        totalPremium -= discount;
        adjustments.push({
          name: step.label,
          amount: round2(-discount),
          stepType: step.type,
        });
        break;
      }

      case "floor":
        if (totalPremium < step.value) {
          const amount = step.value - totalPremium;
          totalPremium = step.value;
          adjustments.push({
            name: `Minimum premium (KES ${step.value.toLocaleString()})`,
            amount: round2(amount),
            stepType: step.type,
          });
        }
        break;

      case "ceil":
        if (totalPremium > step.value) {
          const amount = step.value - totalPremium;
          totalPremium = step.value;
          adjustments.push({
            name: `Maximum premium cap`,
            amount: round2(amount),
            stepType: step.type,
          });
        }
        break;

      default:
        break;
    }
  }

  if (!baseSet) {
    totalPremium = basePremium;
  }

  totalPremium = Math.max(totalPremium, 0);

  return {
    basePremium: round2(basePremium),
    adjustments: adjustments.filter((a) => a.amount !== 0),
    totalPremium: round2(totalPremium),
    monthlyPremium: round2(totalPremium / 12),
  };
}

export function parseFormulaDefinition(data: unknown): PremiumFormulaDefinition {
  if (!data || typeof data !== "object") return { steps: [{ type: "base" }] };
  const obj = data as PremiumFormulaDefinition;
  return { steps: Array.isArray(obj.steps) ? obj.steps : [{ type: "base" }] };
}

export function parseFieldDefinitions(data: unknown): CalculatorField[] {
  if (!Array.isArray(data)) return [];
  return data as CalculatorField[];
}
