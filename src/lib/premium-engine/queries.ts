import { prisma } from "@/lib/prisma";
import {
  parseFieldDefinitions,
  parseFormulaDefinition,
} from "@/lib/premium-engine/evaluator";
import type {
  CalculatorConfigPublic,
  CalculatorField,
  PremiumFormulaDefinition,
} from "@/lib/premium-engine/types";

export interface FormulaVersionDetail {
  id: string;
  version: number;
  status: string;
  name: string | null;
  changelog: string | null;
  basePremium: number;
  formula: PremiumFormulaDefinition;
  fields: CalculatorField[];
  publishedAt: string | null;
  createdAt: string;
}

export interface CalculatorConfigDetail {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  category: string;
  activeVersion: FormulaVersionDetail | null;
  versions: FormulaVersionDetail[];
}

function serializeVersion(v: {
  id: string;
  version: number;
  status: string;
  name: string | null;
  changelog: string | null;
  basePremium: unknown;
  formula: unknown;
  fields: unknown;
  publishedAt: Date | null;
  createdAt: Date;
}): FormulaVersionDetail {
  return {
    id: v.id,
    version: v.version,
    status: v.status,
    name: v.name,
    changelog: v.changelog,
    basePremium: Number(v.basePremium),
    formula: parseFormulaDefinition(v.formula),
    fields: parseFieldDefinitions(v.fields),
    publishedAt: v.publishedAt?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
  };
}

export async function getCalculatorConfigByProductId(
  productId: string
): Promise<CalculatorConfigDetail | null> {
  try {
    const config = await prisma.premiumCalculatorConfig.findUnique({
      where: { productId },
      include: {
        product: { select: { slug: true, name: true } },
        activeVersion: true,
        versions: { orderBy: { version: "desc" } },
      },
    });
    if (!config) return null;

    return {
      id: config.id,
      productId: config.productId,
      productSlug: config.product.slug,
      productName: config.product.name,
      category: config.category,
      activeVersion: config.activeVersion
        ? serializeVersion(config.activeVersion)
        : null,
      versions: config.versions.map(serializeVersion),
    };
  } catch {
    return null;
  }
}

export async function getCalculatorConfigBySlug(
  slug: string
): Promise<CalculatorConfigDetail | null> {
  try {
    const product = await prisma.insuranceProduct.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    });
    if (!product) return null;
    return getCalculatorConfigByProductId(product.id);
  } catch {
    return null;
  }
}

export async function getPublicCalculatorConfig(
  slug: string
): Promise<CalculatorConfigPublic | null> {
  try {
    const config = await prisma.premiumCalculatorConfig.findFirst({
      where: { product: { slug, isActive: true } },
      include: {
        product: { select: { id: true, slug: true, name: true } },
        activeVersion: true,
      },
    });

    if (!config?.activeVersion) return null;

    return {
      productId: config.product.id,
      productSlug: config.product.slug,
      productName: config.product.name,
      category: config.category,
      fields: parseFieldDefinitions(config.activeVersion.fields),
      formulaVersionId: config.activeVersion.id,
      formulaVersion: config.activeVersion.version,
    };
  } catch {
    return null;
  }
}

export async function getAllCalculatorConfigs() {
  try {
    const [products, configs] = await Promise.all([
      prisma.insuranceProduct.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true, category: true, isActive: true },
      }),
      prisma.premiumCalculatorConfig.findMany({
        include: {
          activeVersion: { select: { id: true, version: true, status: true, publishedAt: true } },
          _count: { select: { versions: true } },
        },
      }),
    ]);

    const configByProduct = new Map(configs.map((c) => [c.productId, c]));

    return products.map((p) => {
      const c = configByProduct.get(p.id);
      return {
        productId: p.id,
        productSlug: p.slug,
        productName: p.name,
        productActive: p.isActive,
        category: c?.category ?? p.category ?? "unknown",
        configId: c?.id ?? null,
        versionCount: c?._count.versions ?? 0,
        activeVersion: c?.activeVersion
          ? {
              id: c.activeVersion.id,
              version: c.activeVersion.version,
              status: c.activeVersion.status,
              publishedAt: c.activeVersion.publishedAt?.toISOString() ?? null,
            }
          : null,
      };
    });
  } catch {
    return [];
  }
}

export async function getCalculationAuditLogs(options?: {
  productId?: string;
  limit?: number;
}) {
  try {
    const logs = await prisma.premiumCalculationLog.findMany({
      where: options?.productId ? { productId: options.productId } : undefined,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
      include: {
        product: { select: { name: true, slug: true } },
        formulaVersion: { select: { version: true } },
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      productName: log.product.name,
      productSlug: log.product.slug,
      formulaVersion: log.formulaVersion.version,
      source: log.source,
      input: log.input,
      output: log.output,
      user: log.user
        ? `${log.user.firstName ?? ""} ${log.user.lastName ?? ""}`.trim() || log.user.email
        : null,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getFormulaAuditLogs(limit = 50) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { entity: "premium_formula" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityId: log.entityId,
      user: log.user
        ? `${log.user.firstName ?? ""} ${log.user.lastName ?? ""}`.trim() || log.user.email
        : null,
      oldData: log.oldData,
      newData: log.newData,
      createdAt: log.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
