import { prisma } from "@/lib/prisma";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/validations/product";
import { productDetailInclude, serializeProduct } from "@/lib/products/types";

function nestedCreateData(data: CreateProductInput) {
  return {
    benefits: data.benefits?.length
      ? { create: data.benefits.map((b) => ({ title: b.title, description: b.description, sortOrder: b.sortOrder })) }
      : undefined,
    coverages: data.coverages?.length
      ? {
          create: data.coverages.map((c) => ({
            name: c.name,
            description: c.description,
            limit: c.limit,
            deductible: c.deductible,
            isIncluded: c.isIncluded,
            sortOrder: c.sortOrder,
          })),
        }
      : undefined,
    exclusions: data.exclusions?.length
      ? { create: data.exclusions.map((e) => ({ title: e.title, description: e.description, sortOrder: e.sortOrder })) }
      : undefined,
    eligibilityItems: data.eligibilityItems?.length
      ? {
          create: data.eligibilityItems.map((e) => ({
            title: e.title,
            description: e.description,
            sortOrder: e.sortOrder,
          })),
        }
      : undefined,
    requiredDocuments: data.requiredDocuments?.length
      ? {
          create: data.requiredDocuments.map((d) => ({
            name: d.name,
            description: d.description,
            isRequired: d.isRequired,
            sortOrder: d.sortOrder,
          })),
        }
      : undefined,
    faqs: data.faqs?.length
      ? { create: data.faqs.map((f) => ({ question: f.question, answer: f.answer, sortOrder: f.sortOrder })) }
      : undefined,
  };
}

async function replaceNestedRelations(productId: string, data: UpdateProductInput) {
  if (data.benefits !== undefined) {
    await prisma.productBenefit.deleteMany({ where: { productId } });
    if (data.benefits.length) {
      await prisma.productBenefit.createMany({
        data: data.benefits.map((b) => ({ ...b, productId })),
      });
    }
  }
  if (data.coverages !== undefined) {
    await prisma.productCoverage.deleteMany({ where: { productId } });
    if (data.coverages.length) {
      await prisma.productCoverage.createMany({
        data: data.coverages.map((c) => ({
          productId,
          name: c.name,
          description: c.description,
          limit: c.limit,
          deductible: c.deductible,
          isIncluded: c.isIncluded ?? true,
          sortOrder: c.sortOrder,
        })),
      });
    }
  }
  if (data.exclusions !== undefined) {
    await prisma.productExclusion.deleteMany({ where: { productId } });
    if (data.exclusions.length) {
      await prisma.productExclusion.createMany({
        data: data.exclusions.map((e) => ({ ...e, productId })),
      });
    }
  }
  if (data.eligibilityItems !== undefined) {
    await prisma.productEligibility.deleteMany({ where: { productId } });
    if (data.eligibilityItems.length) {
      await prisma.productEligibility.createMany({
        data: data.eligibilityItems.map((e) => ({ ...e, productId })),
      });
    }
  }
  if (data.requiredDocuments !== undefined) {
    await prisma.productRequiredDocument.deleteMany({ where: { productId } });
    if (data.requiredDocuments.length) {
      await prisma.productRequiredDocument.createMany({
        data: data.requiredDocuments.map((d) => ({ ...d, productId })),
      });
    }
  }
  if (data.faqs !== undefined) {
    await prisma.productFaq.deleteMany({ where: { productId } });
    if (data.faqs.length) {
      await prisma.productFaq.createMany({
        data: data.faqs.map((f) => ({ ...f, productId })),
      });
    }
  }
}

export async function createProduct(input: CreateProductInput) {
  const data = createProductSchema.parse(input);

  const product = await prisma.insuranceProduct.create({
    data: {
      name: data.name,
      slug: data.slug,
      category: data.category,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription,
      icon: data.icon,
      basePremium: data.basePremium,
      pricingFormula: data.pricingFormula ?? undefined,
      claimProcedure: data.claimProcedure,
      terms: data.terms,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      ...nestedCreateData(data),
    },
    include: productDetailInclude,
  });

  return serializeProduct(product);
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const data = updateProductSchema.parse(input);

  const { benefits, coverages, exclusions, eligibilityItems, requiredDocuments, faqs, ...scalar } = data;

  const product = await prisma.insuranceProduct.update({
    where: { id },
    data: {
      ...scalar,
      pricingFormula: scalar.pricingFormula ?? undefined,
    },
    include: productDetailInclude,
  });

  await replaceNestedRelations(id, {
    benefits,
    coverages,
    exclusions,
    eligibilityItems,
    requiredDocuments,
    faqs,
  });

  const refreshed = await prisma.insuranceProduct.findUniqueOrThrow({
    where: { id },
    include: productDetailInclude,
  });

  return serializeProduct(refreshed);
}

export async function deleteProduct(id: string) {
  await prisma.insuranceProduct.delete({ where: { id } });
}

export async function getProductById(id: string) {
  const product = await prisma.insuranceProduct.findUnique({
    where: { id },
    include: productDetailInclude,
  });
  return product ? serializeProduct(product) : null;
}
