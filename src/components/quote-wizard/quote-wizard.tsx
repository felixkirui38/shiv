"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { WizardProgress } from "@/components/quote-wizard/wizard-progress";
import { WizardStepPanels } from "@/components/quote-wizard/wizard-step-panels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuoteWizardData, QuoteWizardState } from "@/types/quote-wizard";
import { TOTAL_WIZARD_STEPS } from "@/types/quote-wizard";

const SESSION_KEY = "shiv_quote_session";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface QuoteWizardProps {
  initialQuote?: QuoteWizardState | null;
  preselectedProductSlug?: string;
}

export function QuoteWizard({ initialQuote, preselectedProductSlug }: QuoteWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quote, setQuote] = useState<QuoteWizardState | null>(initialQuote ?? null);
  const [currentStep, setCurrentStep] = useState(initialQuote?.currentStep ?? 1);
  const [wizardData, setWizardData] = useState<QuoteWizardData>(
    initialQuote?.wizardData ?? {}
  );
  const [loading, setLoading] = useState(!initialQuote);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  const initDraft = useCallback(async () => {
    if (initialQuote || initialized.current) return;
    initialized.current = true;
    setLoading(true);

    const resumeToken = searchParams.get("resume");
    if (resumeToken) {
      const res = await fetch(`/api/quotes/wizard/resume/${resumeToken}`);
      const data = await res.json();
      if (data.success) {
        setQuote(data.data);
        setWizardData(data.data.wizardData);
        setCurrentStep(data.data.currentStep);
        localStorage.setItem("shiv_quote_resume", data.data.resumeToken);
        setLoading(false);
        return;
      }
    }

    const body: Record<string, string> = { sessionId: getSessionId() };
    if (preselectedProductSlug) body.productSlug = preselectedProductSlug;

    const res = await fetch("/api/quotes/wizard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setQuote(data.data);
      setWizardData(data.data.wizardData);
      localStorage.setItem("shiv_quote_resume", data.data.resumeToken);
    } else {
      setError(data.error ?? "Failed to start quote");
    }
    setLoading(false);
  }, [initialQuote, preselectedProductSlug, searchParams]);

  useEffect(() => {
    initDraft();
  }, [initDraft]);

  const autosave = useCallback(
    async (step: number, data: QuoteWizardData) => {
      if (!quote?.id) return;
      setSaving(true);
      try {
        const res = await fetch(`/api/quotes/wizard/${quote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentStep: step, wizardData: data }),
        });
        const result = await res.json();
        if (result.success) {
          setQuote(result.data);
          setLastSaved(new Date());
        }
      } finally {
        setSaving(false);
      }
    },
    [quote?.id]
  );

  useEffect(() => {
    if (!quote?.id) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      autosave(currentStep, wizardData);
    }, 2000);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [wizardData, currentStep, quote?.id, autosave]);

  function updateWizardData(patch: Partial<QuoteWizardData>) {
    setWizardData((prev) => ({ ...prev, ...patch }));
  }

  async function goNext() {
    setError(null);
    if (currentStep < TOTAL_WIZARD_STEPS) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (quote?.id) await autosave(next, wizardData);
    }
  }

  function goBack() {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  function saveAndExit() {
    if (quote?.resumeToken) {
      router.push(`/quote/resume/${quote.resumeToken}`);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !quote) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {quote && (
            <p className="font-heading text-sm text-body">
              Quote ref: <span className="font-semibold text-primary">{quote.quoteNumber}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-body">
          {saving ? (
            <span className="flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" /> Saving...
            </span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1">
              <Save className="size-3" /> Saved {lastSaved.toLocaleTimeString()}
            </span>
          ) : null}
          {quote?.resumeToken && (
            <Button variant="ghost" size="sm" onClick={saveAndExit}>
              Save &amp; exit
            </Button>
          )}
        </div>
      </div>

      <WizardProgress currentStep={currentStep} className="mb-8" />

      <Card className="border-brand shadow-md">
        <CardContent className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {quote && (
                <WizardStepPanels
                  step={currentStep}
                  quote={quote}
                  wizardData={wizardData}
                  updateWizardData={updateWizardData}
                  setQuote={setQuote}
                  setError={setError}
                  onNext={goNext}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4 text-center text-sm text-destructive">{error}</p>
          )}

          <div className="mt-8 flex justify-start border-t border-brand pt-6">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
