"use client";

import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { AnimatedSection } from "@/components/shared/animated-section";
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
import { useProducts } from "@/hooks/use-products";

export function PremiumCalculator() {
  const { products, loading: productsLoading } = useProducts();
  const [product, setProduct] = useState(products[0]?.slug ?? "");
  const [coverage, setCoverage] = useState("500000");
  const [estimate, setEstimate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (products.length && !product) {
      setProduct(products[0].slug);
    }
  }, [products, product]);

  async function calculate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: product,
          coverageAmount: Number(coverage),
          factors: { age: 35, drivingRecord: "clean" },
        }),
      });
      const data = await res.json();
      if (data.success) setEstimate(data.data.totalPremium);
    } catch {
      setEstimate(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-light py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <div className="accent-bar mb-4" />
            <h2 className="mb-3 font-heading text-3xl font-semibold text-dark">
              Premium Calculator
            </h2>
            <p className="text-body">
              Get an instant premium estimate for your insurance needs. Our
              calculator provides indicative pricing based on your selected
              coverage and product type.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className="border-brand bg-white shadow-md">
              <CardHeader className="border-b border-brand bg-primary text-white">
                <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
                  <Calculator className="size-5 text-accent" />
                  Estimate Your Premium
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <label className="mb-1.5 block font-heading text-sm font-medium text-dark">
                    Insurance Product
                  </label>
                  <Select value={product} onValueChange={(v) => v && setProduct(v)}>
                    <SelectTrigger className="w-full border-brand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.slug} value={p.slug}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block font-heading text-sm font-medium text-dark">
                    Coverage Amount (KES)
                  </label>
                  <Input
                    type="number"
                    value={coverage}
                    onChange={(e) => setCoverage(e.target.value)}
                    className="border-brand"
                    placeholder="500,000"
                  />
                </div>
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={calculate}
                  disabled={loading || productsLoading || !product}
                >
                  {loading ? "Calculating..." : "Calculate Premium"}
                </Button>
                {estimate !== null && (
                  <div className="rounded-md border border-brand bg-brand-light p-4 text-center">
                    <p className="text-sm text-body">Estimated Annual Premium</p>
                    <p className="font-heading text-3xl font-semibold text-primary">
                      KES {estimate.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
