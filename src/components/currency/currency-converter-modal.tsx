"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { CurrencyConverterPanel } from "@/components/currency/currency-converter-panel";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";

interface CurrencyConverterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CurrencyConverterModal({
  open,
  onOpenChange,
}: CurrencyConverterModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="currency-converter-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close currency converter"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-brand bg-white p-6 shadow-2xl">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>

        <div className="mb-6 pr-8 text-center">
          <div className="accent-bar mx-auto mb-4" />
          <h2
            id="currency-converter-title"
            className="font-heading text-2xl font-semibold text-primary"
          >
            Currency Converter
          </h2>
          <p className="mt-2 text-sm text-body">
            Check indicative exchange rates for premiums and international cover.
            Rates are for reference only.
          </p>
        </div>

        <CurrencyProvider>
          <CurrencyConverterPanel variant="dark" className="border-white/15 bg-primary" />
        </CurrencyProvider>
      </div>
    </div>
  );
}
