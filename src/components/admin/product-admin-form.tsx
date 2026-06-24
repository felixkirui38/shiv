"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CreateProductInput } from "@/validations/product";

interface ListItem {
  title: string;
  description?: string;
  sortOrder: number;
}

interface FaqItem {
  question: string;
  answer: string;
  sortOrder: number;
}

interface CoverageItem {
  name: string;
  description?: string;
  limit?: number;
  deductible?: number;
  isIncluded: boolean;
  sortOrder: number;
}

interface DocItem {
  name: string;
  description?: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  basePremium: number;
  claimProcedure: string;
  terms: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  sortOrder: number;
  pricingFormula: {
    coverageBase: number;
    coverageRate: number;
    deductibleRate: number;
  };
  benefits: ListItem[];
  coverages: CoverageItem[];
  exclusions: ListItem[];
  eligibilityItems: ListItem[];
  requiredDocuments: DocItem[];
  faqs: FaqItem[];
}

const emptyForm: ProductFormData = {
  name: "",
  slug: "",
  category: "",
  shortDescription: "",
  longDescription: "",
  icon: "shield",
  basePremium: 0,
  claimProcedure: "",
  terms: "",
  metaTitle: "",
  metaDescription: "",
  isActive: true,
  sortOrder: 0,
  pricingFormula: { coverageBase: 100000, coverageRate: 1, deductibleRate: 0.05 },
  benefits: [],
  coverages: [],
  exclusions: [],
  eligibilityItems: [],
  requiredDocuments: [],
  faqs: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductAdminForm({
  initial,
  mode,
}: {
  initial?: Partial<ProductFormData>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: CreateProductInput = {
      name: form.name,
      slug: form.slug,
      category: form.category || undefined,
      shortDescription: form.shortDescription || undefined,
      longDescription: form.longDescription || undefined,
      icon: form.icon || undefined,
      basePremium: Number(form.basePremium),
      pricingFormula: form.pricingFormula,
      claimProcedure: form.claimProcedure || undefined,
      terms: form.terms || undefined,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      benefits: form.benefits,
      coverages: form.coverages,
      exclusions: form.exclusions,
      eligibilityItems: form.eligibilityItems,
      requiredDocuments: form.requiredDocuments,
      faqs: form.faqs,
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${form.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Failed to save product");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                update("name", name);
                if (mode === "create") update("slug", slugify(name));
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              required
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="mt-1"
              placeholder="motor, medical, travel..."
            />
          </div>
          <div>
            <Label htmlFor="icon">Icon key</Label>
            <Input
              id="icon"
              value={form.icon}
              onChange={(e) => update("icon", e.target.value)}
              className="mt-1"
              placeholder="car, heart, shield..."
            />
          </div>
          <div>
            <Label htmlFor="basePremium">Base Premium (KES)</Label>
            <Input
              id="basePremium"
              type="number"
              min={0}
              value={form.basePremium}
              onChange={(e) => update("basePremium", Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="longDescription">Long Description</Label>
            <Textarea
              id="longDescription"
              value={form.longDescription}
              onChange={(e) => update("longDescription", e.target.value)}
              className="mt-1"
              rows={5}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
            />
            <Label htmlFor="isActive">Active (visible on website)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Formula</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Coverage Base</Label>
            <Input
              type="number"
              value={form.pricingFormula.coverageBase}
              onChange={(e) =>
                update("pricingFormula", {
                  ...form.pricingFormula,
                  coverageBase: Number(e.target.value),
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label>Coverage Rate</Label>
            <Input
              type="number"
              step="0.01"
              value={form.pricingFormula.coverageRate}
              onChange={(e) =>
                update("pricingFormula", {
                  ...form.pricingFormula,
                  coverageRate: Number(e.target.value),
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label>Deductible Rate</Label>
            <Input
              type="number"
              step="0.01"
              value={form.pricingFormula.deductibleRate}
              onChange={(e) =>
                update("pricingFormula", {
                  ...form.pricingFormula,
                  deductibleRate: Number(e.target.value),
                })
              }
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <TextListEditor
        title="Benefits"
        items={form.benefits}
        onChange={(benefits) => update("benefits", benefits)}
      />
      <CoverageListEditor
        items={form.coverages}
        onChange={(coverages) => update("coverages", coverages)}
      />
      <TextListEditor
        title="Exclusions"
        items={form.exclusions}
        onChange={(exclusions) => update("exclusions", exclusions)}
      />
      <TextListEditor
        title="Eligibility"
        items={form.eligibilityItems}
        onChange={(eligibilityItems) => update("eligibilityItems", eligibilityItems)}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents Required</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update("requiredDocuments", [
                ...form.requiredDocuments,
                { name: "", isRequired: true, sortOrder: form.requiredDocuments.length },
              ])
            }
          >
            Add Document
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.requiredDocuments.map((doc, i) => (
            <div key={i} className="grid gap-2 rounded border p-3 md:grid-cols-3">
              <Input
                placeholder="Document name"
                value={doc.name}
                onChange={(e) => {
                  const docs = [...form.requiredDocuments];
                  docs[i] = { ...doc, name: e.target.value };
                  update("requiredDocuments", docs);
                }}
              />
              <Input
                placeholder="Description"
                value={doc.description ?? ""}
                onChange={(e) => {
                  const docs = [...form.requiredDocuments];
                  docs[i] = { ...doc, description: e.target.value };
                  update("requiredDocuments", docs);
                }}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={doc.isRequired}
                  onChange={(e) => {
                    const docs = [...form.requiredDocuments];
                    docs[i] = { ...doc, isRequired: e.target.checked };
                    update("requiredDocuments", docs);
                  }}
                />
                Required
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claim Procedure & Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Claim Procedure</Label>
            <Textarea
              value={form.claimProcedure}
              onChange={(e) => update("claimProcedure", e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
          <div>
            <Label>Terms & Conditions</Label>
            <Textarea
              value={form.terms}
              onChange={(e) => update("terms", e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <FaqListEditor items={form.faqs} onChange={(faqs) => update("faqs", faqs)} />

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Meta Title</Label>
            <Input
              value={form.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Meta Description</Label>
            <Textarea
              value={form.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function TextListEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...items, { title: "", description: "", sortOrder: items.length }])
          }
        >
          Add Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="grid gap-2 rounded border p-3 md:grid-cols-2">
            <Input
              placeholder="Title"
              value={item.title}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, title: e.target.value };
                onChange(next);
              }}
            />
            <Input
              placeholder="Description"
              value={item.description ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, description: e.target.value };
                onChange(next);
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CoverageListEditor({
  items,
  onChange,
}: {
  items: CoverageItem[];
  onChange: (items: CoverageItem[]) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Coverage</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...items,
              { name: "", isIncluded: true, sortOrder: items.length },
            ])
          }
        >
          Add Coverage
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="grid gap-2 rounded border p-3 md:grid-cols-2">
            <Input
              placeholder="Coverage name"
              value={item.name}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, name: e.target.value };
                onChange(next);
              }}
            />
            <Input
              placeholder="Description"
              value={item.description ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, description: e.target.value };
                onChange(next);
              }}
            />
            <Input
              type="number"
              placeholder="Limit"
              value={item.limit ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, limit: Number(e.target.value) || undefined };
                onChange(next);
              }}
            />
            <Input
              type="number"
              placeholder="Deductible"
              value={item.deductible ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = {
                  ...item,
                  deductible: Number(e.target.value) || undefined,
                };
                onChange(next);
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FaqListEditor({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>FAQ</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...items, { question: "", answer: "", sortOrder: items.length }])
          }
        >
          Add FAQ
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-2 rounded border p-3">
            <Input
              placeholder="Question"
              value={item.question}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, question: e.target.value };
                onChange(next);
              }}
            />
            <Textarea
              placeholder="Answer"
              value={item.answer}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, answer: e.target.value };
                onChange(next);
              }}
              rows={2}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
