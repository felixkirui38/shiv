import { prisma } from "@/lib/prisma";
import { serializeFormDefinition } from "@/lib/forms/public";

export async function getAdminFormById(id: string) {
  const form = await prisma.formDefinition.findUnique({
    where: { id },
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      product: { select: { id: true, name: true, slug: true } },
      _count: { select: { submissions: true, drafts: true } },
    },
  });

  if (!form) return null;

  return {
    ...serializeFormDefinition(form),
    description: form.description,
    productId: form.productId,
    product: form.product,
    version: form.version,
    isActive: form.isActive,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
    counts: form._count,
  };
}
