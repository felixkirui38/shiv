import type {
  CalculatorField,
  PremiumFormulaDefinition,
} from "@/lib/premium-engine/types";

export type PremiumCategory =
  | "motor"
  | "medical"
  | "travel"
  | "business"
  | "home"
  | "life";

export interface CategoryTemplate {
  category: PremiumCategory;
  fields: CalculatorField[];
  formula: PremiumFormulaDefinition;
}

const motorTemplate: CategoryTemplate = {
  category: "motor",
  fields: [
    { key: "vehicleValue", label: "Vehicle Value (KES)", type: "number", required: true, min: 50000, step: 10000, defaultValue: 1500000 },
    { key: "age", label: "Driver Age", type: "number", required: true, min: 18, max: 99, defaultValue: 35 },
    {
      key: "vehicleType",
      label: "Vehicle Type",
      type: "select",
      required: true,
      options: [
        { value: "sedan", label: "Sedan" },
        { value: "suv", label: "SUV" },
        { value: "truck", label: "Truck / Commercial" },
        { value: "motorcycle", label: "Motorcycle" },
      ],
      defaultValue: "sedan",
    },
    {
      key: "usage",
      label: "Usage",
      type: "select",
      required: true,
      options: [
        { value: "private", label: "Private" },
        { value: "commercial", label: "Commercial" },
      ],
      defaultValue: "private",
    },
    { key: "yearsOwned", label: "Years Owned", type: "number", required: true, min: 0, max: 30, defaultValue: 2 },
  ],
  formula: {
    steps: [
      { type: "base", label: "Base premium" },
      { type: "multiply_field", field: "vehicleValue", rate: 0.025, label: "Vehicle value factor (2.5%)" },
      {
        type: "lookup_multiplier",
        field: "vehicleType",
        map: { sedan: 1, suv: 1.1, truck: 1.25, motorcycle: 0.85 },
        label: "Vehicle type adjustment",
      },
      { type: "condition", field: "usage", operator: "eq", value: "commercial", multiplier: 1.25, label: "Commercial usage surcharge" },
      { type: "condition", field: "age", operator: "lt", value: 25, multiplier: 1.2, label: "Young driver loading" },
      { type: "condition", field: "age", operator: "gt", value: 65, multiplier: 1.15, label: "Senior driver loading" },
      { type: "discount_per_unit", field: "yearsOwned", ratePerUnit: 0.02, maxUnits: 5, label: "Loyalty discount (2% per year, max 5)" },
      { type: "floor", value: 1200 },
    ],
  },
};

const medicalTemplate: CategoryTemplate = {
  category: "medical",
  fields: [
    { key: "dependants", label: "Number of Dependants", type: "number", required: true, min: 0, max: 10, defaultValue: 2 },
    { key: "coverageLimit", label: "Annual Coverage Limit (KES)", type: "number", required: true, min: 100000, step: 100000, defaultValue: 1000000 },
    { key: "age", label: "Primary Member Age", type: "number", required: true, min: 18, max: 75, defaultValue: 35 },
  ],
  formula: {
    steps: [
      { type: "base", label: "Base premium" },
      { type: "per_unit", field: "dependants", amount: 800, label: "Dependants cover" },
      { type: "multiply_field", field: "coverageLimit", rate: 0.0012, label: "Coverage limit factor" },
      { type: "condition", field: "age", operator: "gt", value: 55, multiplier: 1.2, label: "Age 55+ loading" },
      { type: "condition", field: "age", operator: "gt", value: 65, multiplier: 1.35, label: "Age 65+ loading" },
      { type: "floor", value: 2400 },
    ],
  },
};

const travelTemplate: CategoryTemplate = {
  category: "travel",
  fields: [
    {
      key: "destination",
      label: "Destination",
      type: "select",
      required: true,
      options: [
        { value: "domestic", label: "Domestic (Kenya)" },
        { value: "africa", label: "Africa" },
        { value: "europe", label: "Europe / Schengen" },
        { value: "worldwide", label: "Worldwide" },
      ],
      defaultValue: "africa",
    },
    { key: "duration", label: "Trip Duration (days)", type: "number", required: true, min: 1, max: 365, defaultValue: 14 },
    { key: "travellers", label: "Number of Travellers", type: "number", required: true, min: 1, max: 20, defaultValue: 1 },
  ],
  formula: {
    steps: [
      { type: "base", label: "Base premium" },
      { type: "per_unit", field: "duration", amount: 12, label: "Daily rate" },
      { type: "per_unit", field: "travellers", amount: 150, label: "Per traveller" },
      {
        type: "lookup_add",
        field: "destination",
        map: { domestic: 0, africa: 200, europe: 500, worldwide: 800 },
        label: "Destination loading",
      },
      { type: "floor", value: 150 },
    ],
  },
};

const businessTemplate: CategoryTemplate = {
  category: "business",
  fields: [
    { key: "revenue", label: "Annual Revenue (KES)", type: "number", required: true, min: 100000, step: 100000, defaultValue: 5000000 },
    { key: "employees", label: "Number of Employees", type: "number", required: true, min: 1, max: 5000, defaultValue: 10 },
    {
      key: "industry",
      label: "Industry",
      type: "select",
      required: true,
      options: [
        { value: "retail", label: "Retail" },
        { value: "manufacturing", label: "Manufacturing" },
        { value: "construction", label: "Construction" },
        { value: "hospitality", label: "Hospitality" },
        { value: "professional", label: "Professional Services" },
      ],
      defaultValue: "retail",
    },
  ],
  formula: {
    steps: [
      { type: "base", label: "Base premium" },
      { type: "percent_of_field", field: "revenue", percent: 0.15, label: "Revenue factor (0.15%)" },
      { type: "per_unit", field: "employees", amount: 250, label: "Per employee" },
      {
        type: "lookup_multiplier",
        field: "industry",
        map: { retail: 1, manufacturing: 1.2, construction: 1.4, hospitality: 1.15, professional: 0.95 },
        label: "Industry risk factor",
      },
      { type: "floor", value: 3500 },
    ],
  },
};

const homeTemplate: CategoryTemplate = {
  category: "home",
  fields: [
    { key: "propertyValue", label: "Property Value (KES)", type: "number", required: true, min: 500000, step: 100000, defaultValue: 8000000 },
  ],
  formula: {
    steps: [
      { type: "base", label: "Base premium" },
      { type: "multiply_field", field: "propertyValue", rate: 0.0008, label: "Property value factor (0.08%)" },
      { type: "floor", value: 800 },
    ],
  },
};

const lifeTemplate: CategoryTemplate = {
  category: "life",
  fields: [
    { key: "income", label: "Annual Income (KES)", type: "number", required: true, min: 100000, step: 50000, defaultValue: 1200000 },
    { key: "age", label: "Age", type: "number", required: true, min: 18, max: 70, defaultValue: 35 },
    { key: "dependants", label: "Dependants", type: "number", required: true, min: 0, max: 10, defaultValue: 2 },
  ],
  formula: {
    steps: [
      { type: "base", label: "Base premium" },
      { type: "percent_of_field", field: "income", percent: 0.5, label: "Income-based cover (0.5%)" },
      { type: "per_unit", field: "dependants", amount: 300, label: "Dependants factor" },
      { type: "condition", field: "age", operator: "gt", value: 45, multiplier: 1.25, label: "Age 45+ loading" },
      { type: "condition", field: "age", operator: "gt", value: 55, multiplier: 1.5, label: "Age 55+ loading" },
      { type: "floor", value: 500 },
    ],
  },
};

export const categoryTemplates: Record<PremiumCategory, CategoryTemplate> = {
  motor: motorTemplate,
  medical: medicalTemplate,
  travel: travelTemplate,
  business: businessTemplate,
  home: homeTemplate,
  life: lifeTemplate,
};

export const productCategoryMap: Record<string, PremiumCategory> = {
  "motor-insurance": "motor",
  "medical-insurance": "medical",
  "travel-insurance": "travel",
  "business-insurance": "business",
  "home-insurance": "home",
  "life-insurance": "life",
};

export function getCategoryTemplate(category: string): CategoryTemplate | null {
  return categoryTemplates[category as PremiumCategory] ?? null;
}

export function getCategoryForProduct(slug: string, category?: string | null): PremiumCategory | null {
  if (category && category in categoryTemplates) return category as PremiumCategory;
  return productCategoryMap[slug] ?? null;
}
