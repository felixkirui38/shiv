import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import {
  getCategoryForProduct,
  getCategoryTemplate,
} from "@/config/premium-calculator.defaults";
import type { CalculationSource } from "@/generated/prisma/client";
import {
  evaluateFormula,
  parseFieldDefinitions,
  parseFormulaDefinition,
  validateCalculatorInput,
} from "@/lib/premium-engine/evaluator";
import type {
  PremiumCalculationInput,
  PremiumCalculationResult,
} from "@/lib/premium-engine/types";
import { calculateProductPremium } from "@/lib/products/calculator";
import type { PremiumCalculatorInput } from "@/types";

interface CalculateOptions {
  source: CalculationSource;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  versionId?: string;
}

export async function runPremiumCalculation(
  productSlug: string,
  input: PremiumCalculationInput,
  options: CalculateOptions
): Promise<PremiumCalculationResult> {
  const product = await prisma.insuranceProduct.findUnique({
    where: { slug: productSlug },
    include: {
      premiumCalculator: { include: { activeVersion: true } },
    },
  });

  if (!product) throw new Error("Product not found");

  let previewVersion = product.premiumCalculator?.activeVersion ?? null;

  if (options.versionId) {
    previewVersion = await prisma.premiumFormulaVersion.findUnique({
      where: { id: options.versionId },
    });
  }

  if (previewVersion) {
    const fields = parseFieldDefinitions(previewVersion.fields);
    const validationError = validateCalculatorInput(fields, input);
    if (validationError) throw new Error(validationError);

    const formula = parseFormulaDefinition(previewVersion.formula);
    const result = evaluateFormula(
      Number(previewVersion.basePremium),
      formula,
      input
    );

    result.formulaVersionId = previewVersion.id;
    result.formulaVersion = previewVersion.version;

    await logCalculation({
      productId: product.id,
      formulaVersionId: previewVersion.id,
      source: options.source,
      input,
      output: result,
      userId: options.userId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });

    return result;
  }

  // Legacy fallback
  const legacyInput: PremiumCalculatorInput = {
    productType: productSlug,
    coverageAmount: Number(input.factors.coverageLimit ?? input.factors.coverageAmount ?? 500000),
    deductible: Number(input.factors.deductible ?? 0) || undefined,
    factors: input.factors,
  };

  const legacy = await calculateProductPremium(productSlug, legacyInput);
  return { ...legacy, adjustments: legacy.adjustments.map((a) => ({ ...a, stepType: "legacy" })) };
}

async function logCalculation(params: {
  productId: string;
  formulaVersionId: string;
  source: CalculationSource;
  input: PremiumCalculationInput;
  output: PremiumCalculationResult;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.premiumCalculationLog.create({
      data: {
        productId: params.productId,
        formulaVersionId: params.formulaVersionId,
        source: params.source,
        input: params.input as object,
        output: params.output as object,
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch {
    // Non-blocking
  }
}

export async function ensureCalculatorConfig(
  productId: string,
  slug: string,
  category?: string | null,
  basePremium = 0
) {
  const cat = getCategoryForProduct(slug, category);
  if (!cat) return null;

  const template = getCategoryTemplate(cat);
  if (!template) return null;

  const existing = await prisma.premiumCalculatorConfig.findUnique({
    where: { productId },
  });
  if (existing) return existing;

  const config = await prisma.premiumCalculatorConfig.create({
    data: {
      productId,
      category: cat,
      versions: {
        create: {
          version: 1,
          status: "PUBLISHED",
          name: "Initial version",
          changelog: "Seeded from category template",
          basePremium,
          formula: template.formula as object,
          fields: template.fields as object,
          publishedAt: new Date(),
        },
      },
    },
    include: { versions: true },
  });

  const published = config.versions[0];
  await prisma.premiumCalculatorConfig.update({
    where: { id: config.id },
    data: { activeVersionId: published.id },
  });

  return config;
}

export async function createDraftVersion(
  configId: string,
  userId?: string,
  changelog?: string
) {
  const config = await prisma.premiumCalculatorConfig.findUnique({
    where: { id: configId },
    include: { activeVersion: true, versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!config) throw new Error("Config not found");

  const source = config.activeVersion ?? config.versions[0];
  if (!source) throw new Error("No version to copy");

  const nextVersion = (config.versions[0]?.version ?? 0) + 1;

  const draft = await prisma.premiumFormulaVersion.create({
    data: {
      configId,
      version: nextVersion,
      status: "DRAFT",
      name: `Draft v${nextVersion}`,
      changelog: changelog ?? `Draft based on v${source.version}`,
      basePremium: source.basePremium,
      formula: source.formula as object,
      fields: source.fields as object,
      createdById: userId,
    },
  });

  await createAuditLog({
    userId,
    action: "premium_formula.created",
    entity: "premium_formula",
    entityId: draft.id,
    newData: { configId, version: nextVersion, status: "DRAFT" },
  });

  return draft;
}

export async function updateFormulaVersion(
  versionId: string,
  data: {
    name?: string;
    changelog?: string;
    basePremium?: number;
    formula?: object;
    fields?: object;
  },
  userId?: string
) {
  const existing = await prisma.premiumFormulaVersion.findUnique({
    where: { id: versionId },
  });
  if (!existing) throw new Error("Version not found");
  if (existing.status !== "DRAFT") throw new Error("Only draft versions can be edited");

  const updated = await prisma.premiumFormulaVersion.update({
    where: { id: versionId },
    data: {
      name: data.name,
      changelog: data.changelog,
      basePremium: data.basePremium,
      formula: data.formula,
      fields: data.fields,
    },
  });

  await createAuditLog({
    userId,
    action: "premium_formula.updated",
    entity: "premium_formula",
    entityId: versionId,
    oldData: { formula: existing.formula, fields: existing.fields, basePremium: existing.basePremium },
    newData: { formula: updated.formula, fields: updated.fields, basePremium: updated.basePremium },
  });

  return updated;
}

export async function publishFormulaVersion(versionId: string, userId?: string) {
  const version = await prisma.premiumFormulaVersion.findUnique({
    where: { id: versionId },
    include: { config: { include: { activeVersion: true } } },
  });
  if (!version) throw new Error("Version not found");
  if (version.status !== "DRAFT") throw new Error("Only drafts can be published");

  const previousActive = version.config.activeVersion;

  await prisma.$transaction(async (tx) => {
    if (previousActive) {
      await tx.premiumFormulaVersion.update({
        where: { id: previousActive.id },
        data: { status: "ARCHIVED" },
      });
    }

    await tx.premiumFormulaVersion.update({
      where: { id: versionId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        publishedById: userId,
      },
    });

    await tx.premiumCalculatorConfig.update({
      where: { id: version.configId },
      data: { activeVersionId: versionId },
    });
  });

  await createAuditLog({
    userId,
    action: "premium_formula.published",
    entity: "premium_formula",
    entityId: versionId,
    oldData: previousActive ? { activeVersionId: previousActive.id } : null,
    newData: { activeVersionId: versionId, version: version.version },
  });
}
