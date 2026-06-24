"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { useHomepage } from "@/components/providers/homepage-provider";
import {
  AnimatedSection,
  SectionHeader,
} from "@/components/homepage/section-primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CalculatorField,
  PremiumCalculationResult,
} from "@/lib/premium-engine/types";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: CalculatorField;
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  if (field.type === "select" && field.options) {
    return (
      <Select value={String(value)} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="w-full border-brand">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={value}
      min={field.min}
      max={field.max}
      step={field.step}
      onChange={(e) =>
        onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
      }
      className="flex h-9 w-full rounded-md border border-brand bg-transparent px-3 text-sm"
    />
  );
}

export function CoverageCalculatorSection() {
  const { calculator, products } = useHomepage();
  const enabledProducts = products.cards.filter((c) => c.enabled);
  const [slug, setSlug] = useState(enabledProducts[0]?.slug ?? "");
  const [fields, setFields] = useState<CalculatorField[]>([]);
  const [factors, setFactors] = useState<Record<string, string | number>>({});
  const [result, setResult] = useState<PremiumCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${slug}/calculator`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFields(data.data.fields);
          const defaults: Record<string, string | number> = {};
          for (const f of data.data.fields as CalculatorField[]) {
            defaults[f.key] = f.defaultValue ?? (f.type === "number" ? f.min ?? 0 : "");
          }
          setFactors(defaults);
          setResult(null);
        }
      })
      .catch(() => setFields([]));
  }, [slug]);

  async function calculate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factors }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else setResult(null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-light py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <AnimatedSection direction="left">
            <SectionHeader
              title={calculator.title}
              subtitle={calculator.subtitle}
              align="left"
            />
            <ul className="space-y-3 text-sm text-body">
              {[
                "Instant indicative premium estimates",
                "Product-specific fields from CMS formulas",
                "No obligation — purchase cover online anytime",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.1}>
            <Card className="border-brand bg-white shadow-lg">
              <CardHeader className="border-b border-brand bg-primary text-white">
                <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
                  <Calculator className="size-5 text-accent" />
                  Premium Estimator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <label className="mb-1.5 block font-heading text-sm font-medium text-dark">
                    Insurance Product
                  </label>
                  <Select value={slug} onValueChange={(v) => v && setSlug(v)}>
                    <SelectTrigger className="w-full border-brand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enabledProducts.map((p) => (
                        <SelectItem key={p.slug} value={p.slug}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-1.5 block font-heading text-sm font-medium text-dark">
                      {field.label}
                    </label>
                    <FieldInput
                      field={field}
                      value={factors[field.key] ?? ""}
                      onChange={(v) => setFactors((f) => ({ ...f, [field.key]: v }))}
                    />
                  </div>
                ))}
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={calculate}
                  disabled={loading || !fields.length}
                >
                  {loading ? "Calculating..." : "Calculate Premium"}
                </Button>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-brand bg-brand-light p-5 text-center"
                  >
                    <p className="text-sm text-body">Estimated Annual Premium</p>
                    <p className="font-heading text-3xl font-semibold text-primary">
                      KES {result.totalPremium.toLocaleString()}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
