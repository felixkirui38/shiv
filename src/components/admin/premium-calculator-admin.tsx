"use client";

import { useCallback, useEffect, useState } from "react";
import { Calculator, History, Play, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicProductCalculator } from "@/components/products/dynamic-product-calculator";
import type {
  CalculatorConfigDetail,
  FormulaVersionDetail,
} from "@/lib/premium-engine/queries";
import type { CalculatorField } from "@/lib/premium-engine/types";

interface ProductSummary {
  productId: string;
  productSlug: string;
  productName: string;
  category: string;
}

export function PremiumCalculatorAdmin() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [config, setConfig] = useState<CalculatorConfigDetail | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<FormulaVersionDetail | null>(null);
  const [formulaJson, setFormulaJson] = useState("");
  const [fieldsJson, setFieldsJson] = useState("");
  const [basePremium, setBasePremium] = useState(0);
  const [changelog, setChangelog] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [calcLogs, setCalcLogs] = useState<unknown[]>([]);
  const [formulaLogs, setFormulaLogs] = useState<unknown[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "audit">("editor");

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/admin/premium-calculator");
    const data = await res.json();
    if (data.success) {
      setProducts(data.data);
      if (!selectedProductId && data.data[0]) {
        setSelectedProductId(data.data[0].productId);
      }
    }
  }, [selectedProductId]);

  const loadConfig = useCallback(async (productId: string) => {
    if (!productId) return;
    const res = await fetch(`/api/admin/premium-calculator/${productId}`);
    const data = await res.json();
    if (data.success) {
      setConfig(data.data);
      const draft =
        data.data.versions.find((v: FormulaVersionDetail) => v.status === "DRAFT") ??
        data.data.activeVersion;
      if (draft) selectVersion(draft);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    const [calcRes, formulaRes] = await Promise.all([
      fetch(
        `/api/admin/premium-calculator?view=audit-calculations&productId=${selectedProductId}`
      ),
      fetch("/api/admin/premium-calculator?view=audit-formulas"),
    ]);
    const calcData = await calcRes.json();
    const formulaData = await formulaRes.json();
    if (calcData.success) setCalcLogs(calcData.data);
    if (formulaData.success) setFormulaLogs(formulaData.data);
  }, [selectedProductId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (selectedProductId) loadConfig(selectedProductId);
  }, [selectedProductId, loadConfig]);

  useEffect(() => {
    if (activeTab === "audit") loadAudit();
  }, [activeTab, loadAudit]);

  function selectVersion(version: FormulaVersionDetail) {
    setSelectedVersion(version);
    setFormulaJson(JSON.stringify(version.formula, null, 2));
    setFieldsJson(JSON.stringify(version.fields, null, 2));
    setBasePremium(version.basePremium);
    setChangelog(version.changelog ?? "");
  }

  async function createDraft() {
    if (!selectedProductId) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/premium-calculator/${selectedProductId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changelog: "New draft version" }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Draft created");
      await loadConfig(selectedProductId);
    } else {
      setMessage(data.error ?? "Failed to create draft");
    }
    setSaving(false);
  }

  async function saveDraft() {
    if (!selectedVersion || selectedVersion.status !== "DRAFT") return;
    setSaving(true);
    setMessage(null);
    try {
      const formula = JSON.parse(formulaJson);
      const fields = JSON.parse(fieldsJson);
      const res = await fetch(
        `/api/admin/premium-calculator/versions/${selectedVersion.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            basePremium,
            changelog,
            formula,
            fields,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessage("Draft saved");
        await loadConfig(selectedProductId);
      } else {
        setMessage(data.error ?? "Save failed");
      }
    } catch {
      setMessage("Invalid JSON in formula or fields");
    }
    setSaving(false);
  }

  async function publishDraft() {
    if (!selectedVersion || selectedVersion.status !== "DRAFT") return;
    if (!confirm("Publish this version? It will become the live calculator.")) return;
    setSaving(true);
    const res = await fetch(
      `/api/admin/premium-calculator/versions/${selectedVersion.id}/publish`,
      { method: "POST" }
    );
    const data = await res.json();
    if (data.success) {
      setMessage("Version published");
      await loadConfig(selectedProductId);
    } else {
      setMessage(data.error ?? "Publish failed");
    }
    setSaving(false);
  }

  const selectedProduct = products.find((p) => p.productId === selectedProductId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Premium Calculator CMS</h1>
          <p className="text-muted-foreground">
            Configure versioned formulas, preview calculations, and review audit logs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "editor" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("editor")}
          >
            <Calculator className="mr-1 size-4" /> Editor
          </Button>
          <Button
            variant={activeTab === "audit" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("audit")}
          >
            <History className="mr-1 size-4" /> Audit
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="min-w-[240px] flex-1">
            <Label>Product</Label>
            <Select value={selectedProductId} onValueChange={(v) => v && setSelectedProductId(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.productId} value={p.productId}>
                    {p.productName} ({p.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {config && (
            <div className="min-w-[200px]">
              <Label>Version</Label>
              <Select
                value={selectedVersion?.id ?? ""}
                onValueChange={(id) => {
                  const v = config.versions.find((ver) => ver.id === id);
                  if (v) selectVersion(v);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.versions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      v{v.version} — {v.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button variant="outline" onClick={createDraft} disabled={saving}>
            <Play className="mr-1 size-4" /> New Draft
          </Button>
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-md border bg-white p-3 text-sm">{message}</div>
      )}

      {activeTab === "editor" && selectedVersion && selectedProduct && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Formula Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Base Premium (KES)</Label>
                  <Input
                    type="number"
                    value={basePremium}
                    onChange={(e) => setBasePremium(Number(e.target.value))}
                    className="mt-1"
                    disabled={selectedVersion.status !== "DRAFT"}
                  />
                </div>
                <div>
                  <Label>Changelog</Label>
                  <Textarea
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    className="mt-1"
                    rows={2}
                    disabled={selectedVersion.status !== "DRAFT"}
                  />
                </div>
                <div>
                  <Label>Input Fields (JSON)</Label>
                  <Textarea
                    value={fieldsJson}
                    onChange={(e) => setFieldsJson(e.target.value)}
                    className="mt-1 font-mono text-xs"
                    rows={10}
                    disabled={selectedVersion.status !== "DRAFT"}
                  />
                </div>
                <div>
                  <Label>Formula Steps (JSON)</Label>
                  <Textarea
                    value={formulaJson}
                    onChange={(e) => setFormulaJson(e.target.value)}
                    className="mt-1 font-mono text-xs"
                    rows={14}
                    disabled={selectedVersion.status !== "DRAFT"}
                  />
                </div>
                {selectedVersion.status === "DRAFT" && (
                  <div className="flex gap-2">
                    <Button onClick={saveDraft} disabled={saving}>
                      <Save className="mr-1 size-4" /> Save Draft
                    </Button>
                    <Button variant="accent" onClick={publishDraft} disabled={saving}>
                      <Upload className="mr-1 size-4" /> Publish
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <DynamicProductCalculator
              slug={selectedProduct.productSlug}
              productName={selectedProduct.productName}
              versionId={selectedVersion.id}
              preview
              config={{
                productId: selectedProduct.productId,
                productSlug: selectedProduct.productSlug,
                productName: selectedProduct.productName,
                category: selectedProduct.category,
                fields: (() => {
                  try {
                    return JSON.parse(fieldsJson || "[]") as CalculatorField[];
                  } catch {
                    return selectedVersion.fields;
                  }
                })(),
                formulaVersionId: selectedVersion.id,
                formulaVersion: selectedVersion.version,
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Calculation Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] space-y-3 overflow-y-auto text-xs">
              {calcLogs.length === 0 ? (
                <p className="text-muted-foreground">No calculations logged yet.</p>
              ) : (
                calcLogs.map((log) => {
                  const entry = log as {
                    id: string;
                    source: string;
                    productName: string;
                    formulaVersion: number;
                    totalPremium?: number;
                    createdAt: string;
                    output?: { totalPremium?: number };
                  };
                  return (
                    <div key={entry.id} className="rounded border p-3">
                      <p className="font-medium">
                        {entry.productName} · v{entry.formulaVersion} · {entry.source}
                      </p>
                      <p className="text-muted-foreground">
                        KES {(entry.output?.totalPremium ?? 0).toLocaleString()} ·{" "}
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Formula CMS Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] space-y-3 overflow-y-auto text-xs">
              {formulaLogs.length === 0 ? (
                <p className="text-muted-foreground">No formula changes logged yet.</p>
              ) : (
                formulaLogs.map((log) => {
                  const entry = log as {
                    id: string;
                    action: string;
                    entityId: string | null;
                    user: string | null;
                    createdAt: string;
                  };
                  return (
                    <div key={entry.id} className="rounded border p-3">
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-muted-foreground">
                        {entry.user ?? "System"} · {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
