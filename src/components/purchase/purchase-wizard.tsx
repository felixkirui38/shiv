"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PurchaseProgress } from "@/components/purchase/purchase-progress";
import { PurchaseStepPanels } from "@/components/purchase/purchase-step-panels";
import type { CmsFormDefinition, PurchaseApplicationState } from "@/types/purchase";
import { TOTAL_PURCHASE_STEPS } from "@/types/purchase";

function friendlyPurchaseError(message: string): string {
  if (/pool|prisma|invalid.*invocation|ECONN|connection/i.test(message)) {
    return "This service is temporarily unavailable. Please ensure the database is running and try again.";
  }
  return message;
}

interface PurchaseWizardProps {
  productSlug: string;
  productName: string;
  resumeToken?: string;
  initialStep?: number;
}

export function PurchaseWizard({
  productSlug,
  productName,
  resumeToken,
  initialStep = 1,
}: PurchaseWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [application, setApplication] = useState<PurchaseApplicationState | null>(null);
  const [form, setForm] = useState<CmsFormDefinition | null>(null);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  const stepFromUrl = Number(searchParams.get("step"));
  useEffect(() => {
    if (stepFromUrl >= 1 && stepFromUrl <= TOTAL_PURCHASE_STEPS) {
      setCurrentStep(stepFromUrl);
    }
  }, [stepFromUrl]);

  const init = useCallback(async () => {
    setBooting(true);
    setError(null);
    try {
      const formRes = await fetch(`/api/purchase/forms/${productSlug}`);
      const formData = await formRes.json();
      if (!formData.success) throw new Error(formData.error ?? "Form not available");

      let app: PurchaseApplicationState;
      if (resumeToken) {
        const resumeRes = await fetch(`/api/purchase/applications/resume/${resumeToken}`);
        const resumeData = await resumeRes.json();
        if (!resumeData.success) throw new Error(resumeData.error ?? "Could not resume application");
        app = resumeData.data;
        setCurrentStep(app.currentStep || initialStep);
      } else {
        const createRes = await fetch("/api/purchase/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSlug }),
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error(createData.error ?? "Could not start application");
        app = createData.data;
      }

      setForm(formData.data);
      setApplication(app);
      if (!resumeToken && app.resumeToken) {
        router.replace(`/products/${productSlug}/buy?resume=${app.resumeToken}`);
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed to load purchase flow";
      setError(friendlyPurchaseError(raw));
    } finally {
      setBooting(false);
    }
  }, [productSlug, resumeToken, router, initialStep]);

  useEffect(() => {
    init();
  }, [init]);

  if (booting) {
    return (
      <div className="py-16 text-center text-body">Loading your application…</div>
    );
  }

  if (error && !application) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
        {error}
      </div>
    );
  }

  if (!application || !form) return null;

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-body">Purchase {productName}</p>
        <h2 className="font-heading text-2xl font-semibold text-dark">
          Insurance Application
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Ref: {application.applicationNumber}
        </p>
      </div>

      <PurchaseProgress currentStep={currentStep} />

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <PurchaseStepPanels
        application={application}
        form={form}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onApplicationUpdate={setApplication}
        setError={setError}
      />
    </div>
  );
}
