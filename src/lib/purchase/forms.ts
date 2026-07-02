import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import { getFallbackPurchaseFormBySlug } from "@/lib/purchase/form-fallback";
import { serializeFormDefinition } from "@/lib/forms/public";
import type { CmsFormDefinition } from "@/types/purchase";

export async function getPurchaseFormByProductSlug(slug: string): Promise<CmsFormDefinition | null> {
  try {
    const product = await withDbRetry(() =>
      prisma.insuranceProduct.findUnique({
        where: { slug },
        include: {
          formDefinitions: {
            where: { isActive: true },
            include: { fields: { orderBy: { sortOrder: "asc" } } },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      })
    );

    const form = product?.formDefinitions[0];
    if (form) return serializeFormDefinition(form);
  } catch {
    // fall through to static form
  }

  return getFallbackPurchaseFormBySlug(slug);
}
