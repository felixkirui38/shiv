import type { PremiumCalculatorInput, PremiumCalculatorResult } from "@/types";
import { prisma } from "@/lib/prisma";

export async function calculateProductPremium(
  productSlug: string,
  input: PremiumCalculatorInput
): Promise<PremiumCalculatorResult> {
  const product = await prisma.insuranceProduct.findUnique({
    where: { slug: productSlug },
    include: {
      premiumRules: { where: { isActive: true }, orderBy: { priority: "desc" } },
    },
  });

  if (!product) throw new Error("Product not found");

  const formula = product.pricingFormula as {
    coverageBase?: number;
    coverageRate?: number;
    deductibleRate?: number;
  } | null;

  const basePremium = Number(product.basePremium);
  const adjustments: { name: string; amount: number }[] = [];
  let totalPremium = basePremium;

  const coverageBase = formula?.coverageBase ?? 100000;
  const coverageRate = formula?.coverageRate ?? 1;
  const coverageMultiplier = (input.coverageAmount / coverageBase) * coverageRate;

  if (coverageMultiplier !== 1) {
    const adj = basePremium * (coverageMultiplier - 1);
    adjustments.push({ name: "Coverage adjustment", amount: adj });
    totalPremium += adj;
  }

  for (const rule of product.premiumRules) {
    const factorValue = input.factors[rule.fieldKey];
    if (factorValue === undefined) continue;

    const ruleValue = rule.value as { operator: string; value: unknown };
    let applies = false;

    switch (ruleValue.operator) {
      case "eq":
        applies = factorValue === ruleValue.value;
        break;
      case "gt":
        applies = Number(factorValue) > Number(ruleValue.value);
        break;
      case "lt":
        applies = Number(factorValue) < Number(ruleValue.value);
        break;
      case "in":
        applies = (ruleValue.value as unknown[]).includes(factorValue);
        break;
    }

    if (applies) {
      const adj =
        totalPremium * (Number(rule.multiplier) - 1) + Number(rule.fixedAmount);
      adjustments.push({ name: rule.name, amount: adj });
      totalPremium += adj;
    }
  }

  if (input.deductible && input.deductible > 0) {
    const rate = formula?.deductibleRate ?? 0.05;
    const deductibleDiscount = -(input.deductible * rate);
    adjustments.push({ name: "Deductible discount", amount: deductibleDiscount });
    totalPremium += deductibleDiscount;
  }

  totalPremium = Math.max(totalPremium, 0);

  return {
    basePremium,
    adjustments,
    totalPremium: Math.round(totalPremium * 100) / 100,
    monthlyPremium: Math.round((totalPremium / 12) * 100) / 100,
  };
}
