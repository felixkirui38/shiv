"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CalculatorConfigPublic,
  CalculatorField,
  PremiumCalculationResult,
} from "@/lib/premium-engine/types";

interface DynamicProductCalculatorProps {
  slug: string;
  productName: string;
  config?: CalculatorConfigPublic | null;
  versionId?: string;
  preview?: boolean;
  className?: string;
}

function buildDefaults(fields: CalculatorField[]) {
  const factors: Record<string, string | number> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      factors[field.key] = field.defaultValue;
    } else if (field.type === "number") {
      factors[field.key] = field.min ?? 0;
    } else if (field.type === "select" && field.options?.[0]) {
      factors[field.key] = field.options[0].value;
    } else {
      factors[field.key] = "";
    }
  }
  return factors;
}

export function DynamicProductCalculator({
  slug,
  productName,
  config: initialConfig,
  versionId,
  preview = false,
  className,
}: DynamicProductCalculatorProps) {
  const [config, setConfig] = useState<CalculatorConfigPublic | null>(
    initialConfig ?? null
  );
  const [factors, setFactors] = useState<Record<string, string | number>>({});
  const [result, setResult] = useState<PremiumCalculationResult | null>(null);
  const [loading, setLoading] = useState(!initialConfig);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    if (initialConfig) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}/calculator`);
      const data = await res.json();
      if (data.success) setConfig(data.data);
      else setError(data.error ?? "Calculator unavailable");
    } catch {
      setError("Failed to load calculator");
    } finally {
      setLoading(false);
    }
  }, [slug, initialConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (config?.fields) {
      setFactors(buildDefaults(config.fields));
    }
  }, [config]);

  async function calculate() {
    setCalculating(true);
    setError(null);
    try {
      const url = preview && versionId
        ? `/api/admin/premium-calculator/versions/${versionId}/preview`
        : `/api/products/${slug}/calculate`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factors,
          versionId: preview ? versionId : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else {
        setError(data.error ?? "Calculation failed");
        setResult(null);
      }
    } catch {
      setError("Unable to calculate premium");
      setResult(null);
    } finally {
      setCalculating(false);
    }
  }

  const fields = useMemo(() => config?.fields ?? [], [config]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!config || fields.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Premium calculator is not configured for this product.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} id="calculator">
      <CardHeader className="border-b border-brand bg-primary text-white">
        <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
          <Calculator className="size-5 text-accent" />
          Premium Calculator — {productName}
          {config.formulaVersion && (
            <span className="ml-auto text-xs font-normal opacity-80">
              v{config.formulaVersion}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block font-heading text-sm font-medium text-dark">
              {field.label}
              {field.required && <span className="text-accent"> *</span>}
            </label>
            {field.type === "select" && field.options ? (
              <Select
                value={String(factors[field.key] ?? "")}
                onValueChange={(v) => v && setFactors((f) => ({ ...f, [field.key]: v }))}
              >
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
            ) : (
              <Input
                type={field.type === "number" ? "number" : "text"}
                value={factors[field.key] ?? ""}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setFactors((f) => ({
                    ...f,
                    [field.key]:
                      field.type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                  }))
                }
                className="border-brand"
              />
            )}
            {field.helpText && (
              <p className="mt-1 text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        ))}

        <Button
          variant="accent"
          className="w-full"
          onClick={calculate}
          disabled={calculating}
        >
          {calculating ? "Calculating..." : preview ? "Preview Calculation" : "Calculate Premium"}
        </Button>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3 rounded-lg border border-brand bg-brand-light p-5"
          >
            <div className="text-center">
              <p className="text-sm text-body">Estimated Annual Premium</p>
              <p className="font-heading text-3xl font-semibold text-primary">
                KES {result.totalPremium.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-body">
                ~KES {result.monthlyPremium.toLocaleString()}/month
              </p>
            </div>
            <ul className="space-y-1 border-t border-brand pt-3 text-xs text-body">
              <li className="flex justify-between">
                <span>Base premium</span>
                <span>KES {result.basePremium.toLocaleString()}</span>
              </li>
              {result.adjustments.map((adj) => (
                <li key={`${adj.name}-${adj.amount}`} className="flex justify-between">
                  <span>{adj.name}</span>
                  <span>
                    {adj.amount >= 0 ? "+" : ""}
                    KES {adj.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-center text-xs text-muted-foreground">
              Indicative estimate only. Apply now for binding cover and checkout.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
