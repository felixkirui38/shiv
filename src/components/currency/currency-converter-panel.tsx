"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Globe } from "lucide-react";
import { useCurrency } from "@/components/providers/currency-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface CurrencyConverterPanelProps {
  className?: string;
  variant?: "dark" | "light";
}

export function CurrencyConverterPanel({
  className,
  variant = "dark",
}: CurrencyConverterPanelProps) {
  const { currency, setCurrency, convert, ratesLoading } = useCurrency();
  const [amount, setAmount] = useState("10000");
  const [from, setFrom] = useState<CurrencyCode>(BASE_CURRENCY);
  const [to, setTo] = useState<CurrencyCode>("USD");

  const parsedAmount = Number(amount.replace(/,/g, "")) || 0;
  const converted = useMemo(
    () => convert(parsedAmount, from, to),
    [convert, parsedAmount, from, to]
  );

  const rateHint = useMemo(() => {
    if (ratesLoading) return "Loading exchange rates…";
    const sample = convert(1, from, to);
    return `1 ${from} ≈ ${formatCurrency(sample, to)}. Rates are indicative only.`;
  }, [convert, from, to, ratesLoading]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-lg rounded-xl border p-6 text-left",
        isDark
          ? "border-white/15 bg-white/5 shadow-inner"
          : "border-brand bg-brand-light shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "mb-6 flex items-center gap-2",
          isDark ? "text-white/90" : "text-primary"
        )}
      >
        <Globe className="size-5 shrink-0 text-accent" aria-hidden />
        <p className="font-heading text-sm font-medium">
          Site display:{" "}
          <span className={isDark ? "text-white" : "text-dark"}>{currency}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="mb-2 block text-xs font-medium tracking-wide text-accent uppercase">
            Display currency
          </Label>
          <Select
            value={currency}
            onValueChange={(v) => v && setCurrency(v as CurrencyCode)}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                isDark
                  ? "border-white/20 bg-primary/40 text-white"
                  : "border-brand bg-white text-dark"
              )}
            >
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              {CURRENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  {opt.code} — {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={cn("mt-2 text-xs", isDark ? "text-white/50" : "text-body")}>
            Premiums across the site can be shown in this currency.
          </p>
        </div>

        <div className={cn("h-px", isDark ? "bg-white/15" : "bg-brand")} />

        <div>
          <Label className="mb-2 block text-xs font-medium tracking-wide text-accent uppercase">
            Convert amount
          </Label>
          <div className="space-y-3">
            <Input
              type="number"
              min={0}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                isDark
                  ? "border-white/20 bg-primary/40 text-white placeholder:text-white/40"
                  : "border-brand bg-white text-dark"
              )}
              placeholder="Enter amount"
              aria-label="Amount to convert"
            />

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Select
                value={from}
                onValueChange={(v) => v && setFrom(v as CurrencyCode)}
              >
                <SelectTrigger
                  className={cn(
                    isDark
                      ? "border-white/20 bg-primary/40 text-white"
                      : "border-brand bg-white text-dark"
                  )}
                  aria-label="From currency"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200]">
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
                className={cn(
                  "flex size-9 items-center justify-center rounded-md border transition-colors hover:border-accent hover:text-accent",
                  isDark
                    ? "border-white/15 text-white/70"
                    : "border-brand text-body"
                )}
              >
                <ArrowLeftRight className="size-4" />
              </button>

              <Select
                value={to}
                onValueChange={(v) => v && setTo(v as CurrencyCode)}
              >
                <SelectTrigger
                  className={cn(
                    isDark
                      ? "border-white/20 bg-primary/40 text-white"
                      : "border-brand bg-white text-dark"
                  )}
                  aria-label="To currency"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={cn(
                "rounded-lg border px-4 py-3",
                isDark
                  ? "border-white/10 bg-primary/50"
                  : "border-brand bg-white"
              )}
              aria-live="polite"
            >
              <p className={cn("text-xs", isDark ? "text-white/60" : "text-body")}>
                Converted amount
              </p>
              <p
                className={cn(
                  "font-heading text-xl font-semibold",
                  isDark ? "text-white" : "text-primary"
                )}
              >
                {formatCurrency(converted, to)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p
        className={cn(
          "mt-4 text-center text-[11px] leading-relaxed",
          isDark ? "text-white/50" : "text-body"
        )}
      >
        {rateHint}
      </p>
    </div>
  );
}
