import { prisma } from "@/lib/prisma";
import type { CmsFormDefinition, CmsFormField } from "@/types/purchase";

export async function getPurchaseFormByProductSlug(slug: string): Promise<CmsFormDefinition | null> {
  const product = await prisma.insuranceProduct.findUnique({
    where: { slug },
    include: {
      formDefinitions: {
        where: { isActive: true },
        include: { fields: { orderBy: { sortOrder: "asc" } } },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  const form = product?.formDefinitions[0];
  if (!form) return null;

  return {
    id: form.id,
    slug: form.slug,
    name: form.name,
    description: form.description,
    settings: form.settings as CmsFormDefinition["settings"],
    fields: form.fields.map((f) => ({
      id: f.id,
      key: f.key,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder,
      helpText: f.helpText,
      isRequired: f.isRequired,
      sortOrder: f.sortOrder,
      options: f.options,
      validation: f.validation as CmsFormField["validation"],
      defaultValue: f.defaultValue,
    })),
  };
}
