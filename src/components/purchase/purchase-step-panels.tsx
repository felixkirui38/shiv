"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DynamicApplicationForm,
  validateDynamicForm,
} from "@/components/purchase/dynamic-application-form";
import type { CmsFormDefinition, PurchaseApplicationState } from "@/types/purchase";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface PurchaseStepPanelsProps {
  application: PurchaseApplicationState;
  form: CmsFormDefinition;
  currentStep: number;
  onStepChange: (step: number) => void;
  onApplicationUpdate: (app: PurchaseApplicationState) => void;
  setError: (error: string | null) => void;
}

export function PurchaseStepPanels({
  application,
  form,
  currentStep,
  onStepChange,
  onApplicationUpdate,
  setError,
}: PurchaseStepPanelsProps) {
  const [formData, setFormData] = useState(application.formData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(application.formData);
  }, [application.formData]);

  async function saveDraft(step?: number) {
    const res = await fetch(`/api/purchase/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData, currentStep: step ?? currentStep }),
    });
    const data = await res.json();
    if (data.success) onApplicationUpdate(data.data);
    return data;
  }

  async function handleApplicationNext() {
    const errors = validateDynamicForm(form, formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setLoading(true);
    const saved = await saveDraft(2);
    if (!saved.success) {
      setError(saved.error ?? "Failed to save application");
      setLoading(false);
      return;
    }

    const calc = await fetch(`/api/purchase/applications/${application.id}/calculate`, {
      method: "POST",
    });
    const calcData = await calc.json();
    setLoading(false);
    if (calcData.success) {
      onApplicationUpdate(calcData.data.application);
      onStepChange(2);
    } else {
      setError(calcData.error ?? "Premium calculation failed");
    }
  }

  if (currentStep === 1) {
    return (
      <div>
        <p className="mb-6 text-sm text-body">
          Complete your {application.product.name} application. All fields marked * are required.
        </p>
        <DynamicApplicationForm
          form={form}
          values={formData}
          errors={fieldErrors}
          applicationId={application.id}
          resumeToken={application.resumeToken}
          onUploadError={setError}
          onChange={(key, value) => setFormData((prev) => ({ ...prev, [key]: value }))}
        />
        <div className="mt-8 flex justify-end">
          <Button variant="accent" onClick={handleApplicationNext} disabled={loading}>
            {loading ? "Calculating…" : "Calculate Premium"}
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    const breakdown = application.premiumBreakdown;
    return (
      <div>
        <p className="mb-6 text-sm text-body">Your premium has been calculated automatically.</p>
        <Card className="border-brand">
          <CardContent className="space-y-3 p-6">
            <Row label="Basic Premium" value={breakdown?.basicPremium} />
            <Row label="Levies" value={breakdown?.levies} />
            <Row label="Taxes" value={breakdown?.taxes} />
            <Row label="Stamp Duty" value={breakdown?.stampDuty} />
            <div className="border-t border-brand pt-3">
              <Row label="Total Premium" value={breakdown?.totalPremium} bold />
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => onStepChange(1)}>
            Edit Application
          </Button>
          <Button variant="accent" onClick={() => onStepChange(3)}>
            Review Application
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div>
        <p className="mb-6 text-sm text-body">
          Confirm your details before proceeding to payment.
        </p>
        <Card className="border-brand">
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Product</p>
              <p className="font-heading font-semibold text-dark">{application.product.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Application #
              </p>
              <p className="font-mono text-sm">{application.applicationNumber}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {form.fields
                .filter((f) => formData[f.key] !== undefined && formData[f.key] !== "")
                .slice(0, 12)
                .map((f) => (
                  <div key={f.id}>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="text-sm text-body">{formatValue(formData[f.key])}</p>
                  </div>
                ))}
            </div>
            <div className="border-t border-brand pt-3">
              <Row label="Total Premium" value={application.premiumBreakdown?.totalPremium} bold />
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => onStepChange(2)}>
            Back
          </Button>
          <Button variant="accent" onClick={() => onStepChange(4)}>
            Proceed to Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CheckoutStep
      application={application}
      setError={setError}
      onBack={() => onStepChange(3)}
    />
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value?: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold text-dark" : "text-body"}>{label}</span>
      <span className={bold ? "font-heading text-lg font-semibold text-primary" : "text-dark"}>
        KES {(value ?? 0).toLocaleString()}
      </span>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object" && value && "fileName" in value) {
    return String((value as { fileName: string }).fileName);
  }
  return String(value);
}

function CheckoutStep({
  application,
  setError,
  onBack,
}: {
  application: PurchaseApplicationState;
  setError: (e: string | null) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<string[]>(["STRIPE"]);
  const [provider, setProvider] = useState("STRIPE");
  const [mpesaMessage, setMpesaMessage] = useState<string | null>(null);

  const breakdown = application.premiumBreakdown;
  const total = breakdown?.totalPremium ?? application.totalPremium;

  useEffect(() => {
    fetch("/api/payments/checkout")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.providers?.length) {
          setProviders(d.data.providers);
          setProvider(d.data.providers[0]);
        }
      });
  }, []);

  async function checkout() {
    setLoading(true);
    setError(null);
    setMpesaMessage(null);
    const res = await fetch(`/api/purchase/applications/${application.id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    const data = await res.json();
    if (data.success) {
      if (data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else if (data.data.message) {
        setMpesaMessage(data.data.message);
        setLoading(false);
      } else {
        setError("Payment unavailable. Contact us to complete your purchase.");
        setLoading(false);
      }
    } else {
      setError(data.error ?? "Payment unavailable.");
      setLoading(false);
    }
  }

  const providerLabels: Record<string, string> = {
    STRIPE: "Card (Stripe)",
    PESAPAL: "Pesapal",
    FLUTTERWAVE: "Flutterwave",
    MPESA: "M-Pesa",
  };

  return (
    <div>
      <p className="mb-6 text-sm text-body">Complete payment to receive your policy certificate.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-brand">
          <CardContent className="space-y-3 p-6">
            <h3 className="font-heading font-semibold text-primary">Order Summary</h3>
            <p className="text-sm text-body">{application.product.name}</p>
            <Row label="Coverage premium" value={breakdown?.basicPremium} />
            <Row label="Levies & fees" value={(breakdown?.levies ?? 0) + (breakdown?.stampDuty ?? 0)} />
            <div className="border-t border-brand pt-3">
              <Row label="Total Amount" value={total} bold />
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand">
          <CardContent className="space-y-4 p-6">
            <h3 className="font-heading font-semibold text-primary">Payment Method</h3>
            <div className="space-y-2">
              {providers.map((p) => (
                <label
                  key={p}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm",
                    provider === p ? "border-accent bg-accent/5" : "border-brand"
                  )}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={provider === p}
                    onChange={() => setProvider(p)}
                  />
                  {providerLabels[p] ?? p}
                </label>
              ))}
            </div>
            {mpesaMessage && (
              <p className="rounded-md bg-brand-light p-3 text-sm text-primary">{mpesaMessage}</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <button
          type="button"
          onClick={checkout}
          disabled={loading}
          className={cn(buttonVariants({ variant: "accent", size: "lg" }), loading && "opacity-70")}
        >
          {loading ? "Processing…" : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
}
