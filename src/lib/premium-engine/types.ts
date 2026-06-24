export type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in";

export interface CalculatorField {
  key: string;
  label: string;
  type: "number" | "select" | "text";
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
  helpText?: string;
}

export type FormulaStep =
  | { type: "base"; label?: string }
  | { type: "multiply_field"; field: string; rate: number; label: string }
  | { type: "per_unit"; field: string; amount: number; label: string }
  | { type: "percent_of_field"; field: string; percent: number; label: string }
  | {
      type: "condition";
      field: string;
      operator: ConditionOperator;
      value: unknown;
      multiplier?: number;
      fixedAmount?: number;
      label: string;
    }
  | {
      type: "lookup_multiplier";
      field: string;
      map: Record<string, number>;
      default?: number;
      label: string;
    }
  | {
      type: "lookup_add";
      field: string;
      map: Record<string, number>;
      default?: number;
      label: string;
    }
  | {
      type: "discount_per_unit";
      field: string;
      ratePerUnit: number;
      maxUnits: number;
      label: string;
    }
  | { type: "floor"; value: number }
  | { type: "ceil"; value: number };

export interface PremiumFormulaDefinition {
  steps: FormulaStep[];
}

export interface PremiumCalculationInput {
  factors: Record<string, string | number | boolean>;
}

export interface PremiumAdjustment {
  name: string;
  amount: number;
  stepType: string;
}

export interface PremiumCalculationResult {
  basePremium: number;
  adjustments: PremiumAdjustment[];
  totalPremium: number;
  monthlyPremium: number;
  formulaVersionId?: string;
  formulaVersion?: number;
}

export interface CalculatorConfigPublic {
  productId: string;
  productSlug: string;
  productName: string;
  category: string;
  fields: CalculatorField[];
  formulaVersionId: string;
  formulaVersion: number;
}
