"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, ChevronDown, Globe } from "lucide-react";
import { useCurrency } from "@/components/providers/currency-provider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BASE_CURRENCY,
  CURRENCY_OPTIONS,
  formatCurrency,
  type CurrencyCode,
} from "@/lib/currency";
import { cn } from "@/lib/utils";

export function FooterCurrencySelector({ className }: { className?: string }) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency, convert, rates, ratesLoading } = useCurrency();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("10000");
  const [from, setFrom] = useState<CurrencyCode>(BASE_CURRENCY);
  const [to, setTo] = useState<CurrencyCode>("USD");

  const parsedAmount = Number(amount.replace(/,/g, "")) || 0;
  const converted = useMemo(
    () => convert(parsedAmount, from, to),
    [convert, parsedAmount, from, to]
  );

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition-colors hover:border-accent hover:bg-white/10 hover:text-white"
      >
        <Globe className="size-4 shrink-0 text-accent" aria-hidden />
        <span>Currency</span>
        <span className="font-medium text-white">{currency}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute bottom-full left-0 z-20 mb-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-white/15 bg-primary p-4 shadow-xl"
        >
          <p className="mb-3 text-xs font-medium tracking-wide text-accent uppercase">
            Display currency
          </p>
          <Select
            value={currency}
            onValueChange={(v) => v && setCurrency(v as CurrencyCode)}
          >
            <SelectTrigger className="w-full border-white/20 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  {opt.code} — {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="my-4 h-px bg-white/15" />

          <p className="mb-3 text-xs font-medium tracking-wide text-accent uppercase">
            Convert amount
          </p>
          <div className="space-y-3">
            <Input
              type="number"
              min={0}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
              placeholder="Amount"
            />
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Select
                value={from}
                onValueChange={(v) => v && setFrom(v as CurrencyCode)}
              >
                <SelectTrigger className="border-white/20 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                type="button"
                onClick={swap}
                aria-label="Swap currencies"
                className="flex size-8 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-accent hover:text-accent"
              >
                <ArrowLeftRight className="size-4" />
              </button>

              <Select
                value={to}
                onValueChange={(v) => v && setTo(v as CurrencyCode)}
              >
                <SelectTrigger className="border-white/20 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white">
              {formatCurrency(converted, to)}
            </p>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-white/50">
            {ratesLoading
              ? "Loading exchange rates…"
              : `1 ${BASE_CURRENCY} ≈ ${formatCurrency(rates[currency === BASE_CURRENCY ? "USD" : currency], currency === BASE_CURRENCY ? "USD" : currency, { maximumFractionDigits: 4, minimumFractionDigits: 4 })}. Rates are indicative only.`}
          </p>
        </div>
      )}
    </div>
  );
}
