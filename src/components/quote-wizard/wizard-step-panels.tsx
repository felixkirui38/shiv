"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  step1Schema,
  step2Schema,
} from "@/validations/quote-wizard";
import type {
  QuoteWizardData,
  QuoteWizardState,
  WizardDocument,
} from "@/types/quote-wizard";
import type { CalculatorField } from "@/lib/premium-engine/types";
import type { ProductOption } from "@/hooks/use-products";
import {
  buildWhatsAppQuoteLink,
} from "@/lib/quote-wizard/share";

interface WizardStepPanelsProps {
  step: number;
  quote: QuoteWizardState;
  wizardData: QuoteWizardData;
  updateWizardData: (patch: Partial<QuoteWizardData>) => void;
  setQuote: (q: QuoteWizardState) => void;
  setError: (e: string | null) => void;
  onNext: () => void;
}

export function WizardStepPanels({
  step,
  quote,
  wizardData,
  updateWizardData,
  setQuote,
  setError,
  onNext,
}: WizardStepPanelsProps) {
  switch (step) {
    case 1:
      return (
        <StepInsurance
          wizardData={wizardData}
          updateWizardData={updateWizardData}
          setError={setError}
          onNext={onNext}
        />
      );
    case 2:
      return (
        <StepCustomer
          wizardData={wizardData}
          updateWizardData={updateWizardData}
          setError={setError}
          onNext={onNext}
        />
      );
    case 3:
      return (
        <StepCoverage
          quote={quote}
          wizardData={wizardData}
          updateWizardData={updateWizardData}
          onNext={onNext}
        />
      );
    case 4:
      return (
        <StepDocuments
          quoteId={quote.id}
          wizardData={wizardData}
          updateWizardData={updateWizardData}
          onNext={onNext}
          setError={setError}
        />
      );
    case 5:
      return (
        <StepPremium
          quoteId={quote.id}
          wizardData={wizardData}
          updateWizardData={updateWizardData}
          setQuote={setQuote}
          setError={setError}
          onNext={onNext}
        />
      );
    case 6:
      return (
        <StepReview
          quote={quote}
          wizardData={wizardData}
          updateWizardData={updateWizardData}
          setError={setError}
          onNext={onNext}
        />
      );
    case 7:
      return (
        <StepPdf
          quote={quote}
          wizardData={wizardData}
          updateWizardData={updateWizardData}
          setQuote={setQuote}
          setError={setError}
          onNext={onNext}
        />
      );
    case 8:
      return (
        <StepPayment
          quote={quote}
          wizardData={wizardData}
          setError={setError}
        />
      );
    default:
      return null;
  }
}

function StepInsurance({
  wizardData,
  updateWizardData,
  setError,
  onNext,
}: {
  wizardData: QuoteWizardData;
  updateWizardData: (p: Partial<QuoteWizardData>) => void;
  setError: (e: string | null) => void;
  onNext: () => void;
}) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const selected = wizardData.insurance?.productId ?? "";

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function selectProduct(p: ProductOption) {
    updateWizardData({
      insurance: {
        productId: p.id,
        productSlug: p.slug,
        productName: p.name,
        category: p.category ?? undefined,
      },
    });
  }

  function handleContinue() {
    const parsed = step1Schema.safeParse(wizardData.insurance);
    if (!parsed.success) {
      setError("Please select an insurance product");
      return;
    }
    setError(null);
    onNext();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-dark">
        Select Insurance Type
      </h2>
      <p className="mb-6 text-sm text-body">
        Choose the type of coverage you need. You can change this later before submitting.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((p) => {
          const Icon = getIcon(p.icon ?? "shield");
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProduct(p)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
                active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-brand hover:border-secondary/40 hover:bg-brand-light"
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  active ? "bg-primary text-white" : "bg-primary/5 text-primary"
                )}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <p className="font-heading font-semibold text-dark">{p.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-body">
                  {p.shortDescription}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="accent" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function StepCustomer({
  wizardData,
  updateWizardData,
  setError,
  onNext,
}: {
  wizardData: QuoteWizardData;
  updateWizardData: (p: Partial<QuoteWizardData>) => void;
  setError: (e: string | null) => void;
  onNext: () => void;
}) {
  const c = wizardData.customer ?? {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    idNumber: "",
    kraPin: "",
  };

  function setField(key: keyof typeof c, value: string) {
    updateWizardData({ customer: { ...c, [key]: value } });
  }

  function handleContinue() {
    const parsed = step2Schema.safeParse(c);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete all fields");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-dark">
        Customer Information
      </h2>
      <p className="mb-6 text-sm text-body">
        Your details are encrypted and used only for this quotation.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["firstName", "First Name", "text"],
            ["lastName", "Last Name", "text"],
            ["email", "Email Address", "email"],
            ["phone", "Phone Number", "tel"],
            ["dateOfBirth", "Date of Birth", "date"],
            ["idNumber", "National ID Number", "text"],
            ["kraPin", "KRA PIN", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <div key={key} className={key === "email" ? "sm:col-span-2" : ""}>
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type={type}
              value={c[key]}
              onChange={(e) => setField(key, e.target.value)}
              className="mt-1 border-brand"
              required
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="accent" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function StepCoverage({
  quote,
  wizardData,
  updateWizardData,
  onNext,
}: {
  quote: QuoteWizardState;
  wizardData: QuoteWizardData;
  updateWizardData: (p: Partial<QuoteWizardData>) => void;
  onNext: () => void;
}) {
  const [fields, setFields] = useState<CalculatorField[]>([]);
  const [loading, setLoading] = useState(true);
  const slug = wizardData.insurance?.productSlug ?? quote.product?.slug ?? "";
  const factors = wizardData.coverage?.factors ?? {};

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${slug}/calculator`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFields(d.data.fields);
          const defaults: Record<string, string | number | boolean> = { ...factors };
          for (const f of d.data.fields as CalculatorField[]) {
            if (defaults[f.key] === undefined && f.defaultValue !== undefined) {
              defaults[f.key] = f.defaultValue;
            }
          }
          updateWizardData({ coverage: { factors: defaults } });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-dark">
        Coverage Options
      </h2>
      <p className="mb-6 text-sm text-body">
        Tailor your {wizardData.insurance?.productName} cover to your needs.
      </p>
      {fields.length === 0 ? (
        <p className="text-sm text-body">No additional coverage options for this product.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key}>
              <Label>{field.label}</Label>
              {field.type === "select" && field.options ? (
                <Select
                  value={String(factors[field.key] ?? "")}
                  onValueChange={(v) =>
                    v &&
                    updateWizardData({
                      coverage: {
                        factors: { ...factors, [field.key]: v },
                      },
                    })
                  }
                >
                  <SelectTrigger className="mt-1 border-brand">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type === "number" ? "number" : "text"}
                  value={String(factors[field.key] ?? "")}
                  min={field.min}
                  max={field.max}
                  onChange={(e) =>
                    updateWizardData({
                      coverage: {
                        factors: {
                          ...factors,
                          [field.key]:
                            field.type === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1 border-brand"
                />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button variant="accent" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function StepDocuments({
  quoteId,
  wizardData,
  updateWizardData,
  onNext,
  setError,
}: {
  quoteId: string;
  wizardData: QuoteWizardData;
  updateWizardData: (p: Partial<QuoteWizardData>) => void;
  onNext: () => void;
  setError: (e: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const items = wizardData.documents?.items ?? [];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/quotes/wizard/${quoteId}/documents`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        updateWizardData({
          documents: { items: [...items, data.data.document as WizardDocument] },
        });
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removeDoc(documentId: string) {
    await fetch(`/api/quotes/wizard/${quoteId}/documents?documentId=${documentId}`, {
      method: "DELETE",
    });
    updateWizardData({
      documents: { items: items.filter((d) => d.id !== documentId) },
    });
  }

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-dark">
        Document Upload
      </h2>
      <p className="mb-6 text-sm text-body">
        Upload supporting documents (PDF, PNG, JPG). Max 10MB per file.
      </p>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-brand bg-brand-light/50 p-8 transition-colors hover:bg-brand-light">
        <Upload className="mb-2 size-8 text-primary" />
        <span className="font-heading text-sm font-medium text-primary">
          {uploading ? "Uploading..." : "Click to upload"}
        </span>
        <span className="mt-1 text-xs text-body">PDF · PNG · JPG</span>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          disabled={uploading}
          onChange={handleUpload}
        />
      </label>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-brand p-3"
            >
              <div className="flex items-center gap-2 text-sm">
                <FileText className="size-4 text-primary" />
                <span>{doc.fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(doc.id)}
                className="text-destructive hover:opacity-80"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onNext}>
          Skip for now
        </Button>
        <Button variant="accent" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function StepPremium({
  quoteId,
  wizardData,
  updateWizardData,
  setQuote,
  setError,
  onNext,
}: {
  quoteId: string;
  wizardData: QuoteWizardData;
  updateWizardData: (p: Partial<QuoteWizardData>) => void;
  setQuote: (q: QuoteWizardState) => void;
  setError: (e: string | null) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const result = wizardData.premium?.result;

  async function calculate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/quotes/wizard/${quoteId}/calculate`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      updateWizardData({
        premium: {
          result: data.data.result,
          calculatedAt: new Date().toISOString(),
        },
      });
      setQuote(data.data.quote);
    } else {
      setError(data.error ?? "Calculation failed");
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-dark">
        Premium Calculation
      </h2>
      <p className="mb-6 text-sm text-body">
        We&apos;ll calculate your indicative annual premium based on your coverage selections.
      </p>

      {!result ? (
        <div className="rounded-lg border border-brand bg-brand-light p-8 text-center">
          <Shield className="mx-auto mb-3 size-10 text-primary" />
          <Button variant="accent" onClick={calculate} disabled={loading}>
            {loading ? "Calculating..." : "Calculate Premium"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border border-brand bg-brand-light p-6">
          <div className="text-center">
            <p className="text-sm text-body">Estimated Annual Premium</p>
            <p className="font-heading text-4xl font-semibold text-primary">
              KES {result.totalPremium.toLocaleString()}
            </p>
            <p className="text-xs text-body">
              ~KES {result.monthlyPremium.toLocaleString()}/month
            </p>
          </div>
          <ul className="space-y-1 border-t border-brand pt-3 text-sm text-body">
            <li className="flex justify-between">
              <span>Base</span>
              <span>KES {result.basePremium.toLocaleString()}</span>
            </li>
            {result.adjustments.map((a) => (
              <li key={a.name} className="flex justify-between">
                <span>{a.name}</span>
                <span>
                  {a.amount >= 0 ? "+" : ""}KES {a.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={calculate} disabled={loading}>
              Recalculate
            </Button>
            <Button variant="accent" onClick={onNext}>
              Continue to Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepReview({
  quote,
  wizardData,
  updateWizardData,
  setError,
  onNext,
}: {
  quote: QuoteWizardState;
  wizardData: QuoteWizardData;
  updateWizardData: (p: Partial<QuoteWizardData>) => void;
  setError: (e: string | null) => void;
  onNext: () => void;
}) {
  const c = wizardData.customer;
  const premium =
    wizardData.premium?.result?.totalPremium ?? quote.estimatedPremium;
  const accepted = wizardData.review?.termsAccepted ?? false;

  function handleContinue() {
    if (!accepted) {
      setError("Please accept the terms and conditions");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-dark">
        Review Your Quote
      </h2>
      <p className="mb-6 text-sm text-body">
        Please verify all details before generating your official quote document.
      </p>

      <dl className="space-y-3 rounded-lg border border-brand p-4 text-sm">
        <div className="flex justify-between border-b border-brand pb-2">
          <dt className="text-body">Product</dt>
          <dd className="font-medium">{wizardData.insurance?.productName}</dd>
        </div>
        {c && (
          <>
            <div className="flex justify-between">
              <dt className="text-body">Customer</dt>
              <dd className="font-medium">
                {c.firstName} {c.lastName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">Email</dt>
              <dd>{c.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">Phone</dt>
              <dd>{c.phone}</dd>
            </div>
          </>
        )}
        <div className="flex justify-between border-t border-brand pt-2">
          <dt className="font-heading font-semibold text-primary">Annual Premium</dt>
          <dd className="font-heading text-lg font-semibold text-primary">
            KES {premium.toLocaleString()}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-body">Documents</dt>
          <dd>{wizardData.documents?.items?.length ?? 0} uploaded</dd>
        </div>
      </dl>

      <label className="mt-6 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) =>
            updateWizardData({ review: { termsAccepted: e.target.checked } })
          }
          className="mt-1"
        />
        <span className="text-body">
          I confirm the information provided is accurate and I agree to Shiv Insurance
          Brokers&apos; terms and privacy policy.
        </span>
      </label>

      <div className="mt-6 flex justify-end">
        <Button variant="accent" onClick={handleContinue}>
          Generate Quote
        </Button>
      </div>
    </div>
  );
}

function StepPdf({
  quote,
  wizardData,
  updateWizardData,
  setQuote,
  setError,
  onNext,
}: {
  quote: QuoteWizardState;
  wizardData: QuoteWizardData;
  updateWizardData: (p: Partial<QuoteWizardData>) => void;
  setQuote: (q: QuoteWizardState) => void;
  setError: (e: string | null) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const pdfUrl = wizardData.pdf?.pdfUrl ?? quote.pdfUrl;

  async function generatePdf() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/quotes/wizard/${quote.id}/pdf`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      updateWizardData({ pdf: { pdfUrl: data.data.pdfUrl, generatedAt: new Date().toISOString() } });
      setQuote(data.data.quote);
    } else {
      setError(data.error ?? "PDF generation failed");
    }
    setLoading(false);
  }

  async function emailQuote() {
    setEmailing(true);
    const res = await fetch(`/api/quotes/wizard/${quote.id}/share`, { method: "POST" });
    const data = await res.json();
    if (!data.success) setError(data.error ?? "Failed to send email");
    setEmailing(false);
  }

  const premium =
    wizardData.premium?.result?.totalPremium ?? quote.estimatedPremium;
  const whatsappUrl = buildWhatsAppQuoteLink({
    quoteNumber: quote.quoteNumber,
    productName: wizardData.insurance?.productName ?? "Insurance",
    premium,
    customerName: wizardData.customer
      ? `${wizardData.customer.firstName} ${wizardData.customer.lastName}`
      : undefined,
  });

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-dark">
        Your Quote PDF
      </h2>
      <p className="mb-6 text-sm text-body">
        Download, email, or share your quotation via WhatsApp.
      </p>

      {!pdfUrl ? (
        <div className="rounded-lg border border-dashed border-brand p-8 text-center">
          <FileText className="mx-auto mb-3 size-12 text-primary" />
          <Button variant="accent" onClick={generatePdf} disabled={loading}>
            {loading ? "Generating..." : "Generate Quote PDF"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-brand bg-brand-light p-6 text-center">
            <p className="mb-2 font-heading font-semibold text-primary">
              Quote {quote.quoteNumber} ready
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "accent" }), "gap-2")}
            >
              <Download className="size-4" /> Download PDF
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={emailQuote} disabled={emailing} className="gap-2">
              <Mail className="size-4" />
              {emailing ? "Sending..." : "Email Quote"}
            </Button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <MessageCircle className="size-4" /> WhatsApp Quote
            </a>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="accent" onClick={onNext}>
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepPayment({
  quote,
  wizardData,
  setError,
}: {
  quote: QuoteWizardState;
  wizardData: QuoteWizardData;
  setError: (e: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<string[]>(["STRIPE"]);
  const [provider, setProvider] = useState("STRIPE");
  const [planType, setPlanType] = useState("ANNUAL");
  const [installmentCount, setInstallmentCount] = useState(3);
  const [mpesaMessage, setMpesaMessage] = useState<string | null>(null);

  const premium =
    wizardData.premium?.result?.totalPremium ?? quote.estimatedPremium;
  const installmentAmount =
    planType === "INSTALLMENT" ? Math.ceil(premium / installmentCount) : premium;

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
    const res = await fetch(`/api/quotes/wizard/${quote.id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        planType,
        installmentCount: planType === "INSTALLMENT" ? installmentCount : undefined,
      }),
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
      setError(data.error ?? "Payment unavailable. Contact us to complete your purchase.");
      setLoading(false);
    }
  }

  const providerLabels: Record<string, string> = {
    STRIPE: "Stripe (Card)",
    PESAPAL: "Pesapal",
    FLUTTERWAVE: "Flutterwave",
    MPESA: "M-Pesa",
  };

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-dark">
        Secure Payment
      </h2>
      <p className="mb-6 text-sm text-body">
        Choose your payment method and plan. You will be redirected to our secure
        payment partner or receive an STK push for M-Pesa.
      </p>

      <div className="space-y-4 rounded-lg border border-brand bg-brand-light p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Payment provider</Label>
            <Select value={provider} onValueChange={(v) => v && setProvider(v)}>
              <SelectTrigger className="mt-1 border-brand bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p} value={p}>
                    {providerLabels[p] ?? p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment plan</Label>
            <Select value={planType} onValueChange={(v) => v && setPlanType(v)}>
              <SelectTrigger className="mt-1 border-brand bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANNUAL">Annual (one-time)</SelectItem>
                <SelectItem value="ONE_TIME">One-time</SelectItem>
                <SelectItem value="SUBSCRIPTION">Monthly subscription</SelectItem>
                <SelectItem value="INSTALLMENT">Installments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {planType === "INSTALLMENT" && (
          <div className="max-w-xs">
            <Label>Number of installments</Label>
            <Select
              value={String(installmentCount)}
              onValueChange={(v) => v && setInstallmentCount(Number(v))}
            >
              <SelectTrigger className="mt-1 border-brand bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 6, 12].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} payments
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-body">Amount due now</p>
          <p className="font-heading text-3xl font-semibold text-primary">
            KES {installmentAmount.toLocaleString()}
          </p>
          {planType === "INSTALLMENT" && (
            <p className="text-xs text-body">
              Total KES {premium.toLocaleString()} over {installmentCount} installments
            </p>
          )}
          <p className="mt-1 text-xs text-body">Quote {quote.quoteNumber}</p>
        </div>

        {mpesaMessage && (
          <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            {mpesaMessage}
          </div>
        )}

        <Button
          variant="accent"
          size="lg"
          className="w-full"
          onClick={checkout}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay with ${providerLabels[provider] ?? provider}`}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Prefer to pay later?{" "}
          <Link href="/contact" className="text-secondary underline">
            Contact an advisor
          </Link>
        </p>
      </div>
    </div>
  );
}
