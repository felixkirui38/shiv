import type { PrismaClient, FormFieldType } from "@/generated/prisma/client";
import { defaultPurchaseFormsBySlug } from "../src/config/purchase-forms.defaults";

export async function seedPurchaseForms(prisma: PrismaClient) {
  for (const [productSlug, config] of Object.entries(defaultPurchaseFormsBySlug)) {
    const product = await prisma.insuranceProduct.findUnique({
      where: { slug: productSlug },
    });
    if (!product) continue;

    const formSlug = `${productSlug}-application`;
    const sections = [...new Set(config.fields.map((f) => f.section))];

    const form = await prisma.formDefinition.upsert({
      where: { slug: formSlug },
      update: {
        name: config.name,
        productId: product.id,
        isActive: true,
        settings: { sections: sections.map((title, i) => ({ id: `s${i}`, title })) },
      },
      create: {
        slug: formSlug,
        name: config.name,
        productId: product.id,
        isActive: true,
        settings: { sections: sections.map((title, i) => ({ id: `s${i}`, title })) },
      },
    });

    await prisma.formField.deleteMany({ where: { formId: form.id } });

    await prisma.formField.createMany({
      data: config.fields.map((f, i) => ({
        formId: form.id,
        key: f.key,
        label: f.label,
        type: f.type as FormFieldType,
        placeholder: f.placeholder,
        isRequired: f.isRequired ?? false,
        sortOrder: i,
        options: f.options ? (f.options as object) : undefined,
        validation: { section: f.section },
      })),
    });
  }

  console.log("Purchase application forms seeded.");
}
