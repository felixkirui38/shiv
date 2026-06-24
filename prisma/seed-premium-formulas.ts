import type { PrismaClient } from "@/generated/prisma/client";
import { getCategoryForProduct, getCategoryTemplate } from "@/config/premium-calculator.defaults";

export async function seedPremiumFormulas(prisma: PrismaClient) {
  const products = await prisma.insuranceProduct.findMany({
    select: { id: true, slug: true, category: true, basePremium: true },
  });

  for (const product of products) {
    const cat = getCategoryForProduct(product.slug, product.category);
    if (!cat) continue;

    const template = getCategoryTemplate(cat);
    if (!template) continue;

    const existing = await prisma.premiumCalculatorConfig.findUnique({
      where: { productId: product.id },
    });
    if (existing) continue;

    const config = await prisma.premiumCalculatorConfig.create({
      data: {
        productId: product.id,
        category: cat,
        versions: {
          create: {
            version: 1,
            status: "PUBLISHED",
            name: `${template.category} — initial formula`,
            changelog: "Seeded from category template",
            basePremium: product.basePremium,
            formula: template.formula as object,
            fields: template.fields as object,
            publishedAt: new Date(),
          },
        },
      },
      include: { versions: true },
    });

    await prisma.premiumCalculatorConfig.update({
      where: { id: config.id },
      data: { activeVersionId: config.versions[0].id },
    });
  }

  console.log("Premium calculator formulas seeded.");
}
