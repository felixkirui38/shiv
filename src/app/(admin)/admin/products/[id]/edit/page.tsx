import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products/mutations";
import { ProductAdminForm, type ProductFormData } from "@/components/admin/product-admin-form";

export const metadata = { title: "Edit Product | Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const formula = product.pricingFormula as ProductFormData["pricingFormula"] | null;

  const initial: ProductFormData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category ?? "",
    shortDescription: product.shortDescription ?? "",
    longDescription: product.longDescription ?? "",
    icon: product.icon ?? "shield",
    basePremium: product.basePremium,
    claimProcedure: product.claimProcedure ?? "",
    terms: product.terms ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    pricingFormula: formula ?? {
      coverageBase: 100000,
      coverageRate: 1,
      deductibleRate: 0.05,
    },
    benefits: product.benefits.map((b) => ({
      title: b.title,
      description: b.description ?? "",
      sortOrder: b.sortOrder,
    })),
    coverages: product.coverages.map((c) => ({
      name: c.name,
      description: c.description ?? "",
      limit: c.limit ? Number(c.limit) : undefined,
      deductible: c.deductible ? Number(c.deductible) : undefined,
      isIncluded: c.isIncluded,
      sortOrder: c.sortOrder,
    })),
    exclusions: product.exclusions.map((e) => ({
      title: e.title,
      description: e.description ?? "",
      sortOrder: e.sortOrder,
    })),
    eligibilityItems: product.eligibilityItems.map((e) => ({
      title: e.title,
      description: e.description ?? "",
      sortOrder: e.sortOrder,
    })),
    requiredDocuments: product.requiredDocuments.map((d) => ({
      name: d.name,
      description: d.description ?? "",
      isRequired: d.isRequired,
      sortOrder: d.sortOrder,
    })),
    faqs: product.faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
    })),
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Edit: {product.name}</h1>
      <ProductAdminForm mode="edit" initial={initial} />
    </div>
  );
}
