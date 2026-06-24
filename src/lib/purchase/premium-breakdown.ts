import type { PremiumCalculationResult } from "@/lib/premium-engine/types";
import type { PremiumBreakdown } from "@/types/purchase";

const IRA_LEVY_RATE = 0.0045;
const TRAINING_LEVY_RATE = 0.002;
const STAMP_DUTY_FLAT = 40;

export function buildPremiumBreakdown(result: PremiumCalculationResult): PremiumBreakdown {
  const basicPremium = Math.round(result.totalPremium);
  const levies = Math.round(basicPremium * (IRA_LEVY_RATE + TRAINING_LEVY_RATE));
  const taxes = 0;
  const stampDuty = STAMP_DUTY_FLAT;
  const totalPremium = basicPremium + levies + taxes + stampDuty;

  return {
    basicPremium,
    levies,
    taxes,
    stampDuty,
    totalPremium,
    adjustments: result.adjustments,
  };
}

function ageFromDateOfBirth(dob: string): number | undefined {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function mapFormDataToFactors(
  formData: Record<string, unknown>
): Record<string, string | number | boolean> {
  const factors: Record<string, string | number | boolean> = {};

  const aliases: Record<string, string> = {
    vehicle_value: "vehicleValue",
    vehicleValue: "vehicleValue",
    vehicle_usage: "usage",
    vehicleUsage: "usage",
    cover_type: "coverageType",
    coverType: "coverageType",
    coverage_limit: "coverageLimit",
    coverageLimit: "coverageLimit",
    travellers_count: "travellers",
    travellersCount: "travellers",
    property_value: "propertyValue",
    propertyValue: "propertyValue",
    contents_value: "contentsValue",
    contentsValue: "contentsValue",
    shipment_value: "shipmentValue",
    shipmentValue: "shipmentValue",
    employees: "employeeCount",
    employeeCount: "employeeCount",
    turnover: "annualTurnover",
    annualTurnover: "annualTurnover",
    assets_value: "assetsValue",
    assetsValue: "assetsValue",
  };

  for (const [key, value] of Object.entries(formData)) {
    if (value === undefined || value === null || value === "") continue;
    const mappedKey = aliases[key] ?? key;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      factors[mappedKey] = value;
    }
  }

  const dob =
    (formData.dateOfBirth as string) ??
    (formData.date_of_birth as string) ??
    (formData.dob as string);
  if (dob) {
    const age = ageFromDateOfBirth(dob);
    if (age !== undefined) factors.age = age;
  }

  if (formData.dependants !== undefined) factors.dependants = Number(formData.dependants);
  if (formData.familyMembers !== undefined && factors.dependants === undefined) {
    factors.dependants = Math.max(0, Number(formData.familyMembers) - 1);
  }

  return factors;
}
