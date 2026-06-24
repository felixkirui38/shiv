"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PremiumCalculatorResult } from "@/types";

interface ProductCalculatorProps {
  slug: string;
  productName: string;
  defaultCoverage?: number;
}

export function ProductCalculator({
  slug,
  productName,
  defaultCoverage = 500000,
}: ProductCalculatorProps) {
  const [coverage, setCoverage] = useState(String(defaultCoverage));
  const [deductible, setDeductible] = useState("0");
  const [result, setResult] = useState<PremiumCalculatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function calculate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${slug}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: slug,
          coverageAmount: Number(coverage),
          deductible: Number(deductible) || undefined,
          factors: { age: 35, drivingRecord: "clean" },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error ?? "Calculation failed");
        setResult(null);
      }
    } catch {
      setError("Unable to calculate premium. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-brand bg-white shadow-lg" id="calculator">
      <CardHeader className="border-b border-brand bg-primary text-white">
        <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
          <Calculator className="size-5 text-accent" />
          Premium Calculator — {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div>
          <label className="mb-1.5 block font-heading text-sm font-medium text-dark">
            Coverage Amount (KES)
          </label>
          <Input
            type="number"
            value={coverage}
            onChange={(e) => setCoverage(e.target.value)}
            className="border-brand"
            min={0}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-heading text-sm font-medium text-dark">
            Deductible (KES)
          </label>
          <Input
            type="number"
            value={deductible}
            onChange={(e) => setDeductible(e.target.value)}
            className="border-brand"
            min={0}
          />
        </div>
        <Button
          variant="accent"
          className="w-full"
          onClick={calculate}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Premium"}
        </Button>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

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
            {result.adjustments.length > 0 && (
              <ul className="space-y-1 border-t border-brand pt-3 text-xs text-body">
                <li className="flex justify-between">
                  <span>Base premium</span>
                  <span>KES {result.basePremium.toLocaleString()}</span>
                </li>
                {result.adjustments.map((adj) => (
                  <li key={adj.name} className="flex justify-between">
                    <span>{adj.name}</span>
                    <span>
                      {adj.amount >= 0 ? "+" : ""}
                      KES {adj.amount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Indicative estimate only. Apply now for binding cover and checkout.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
