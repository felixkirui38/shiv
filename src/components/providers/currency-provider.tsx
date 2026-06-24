"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BASE_CURRENCY,
  convertCurrency,
  FALLBACK_RATES,
  formatCurrency,
  formatFromKes,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency";

const STORAGE_KEY = "shiv-display-currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  ratesLoading: boolean;
  convert: (amount: number, from: CurrencyCode, to?: CurrencyCode) => number;
  format: (amount: number, from?: CurrencyCode) => string;
  formatKes: (amountKes: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(BASE_CURRENCY);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isCurrencyCode(stored)) {
      setCurrencyState(stored);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/currency/rates")
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: { rates?: Record<CurrencyCode, number> } }) => {
        if (cancelled || !body.success || !body.data?.rates) return;
        setRates((prev) => ({ ...prev, ...body.data!.rates }));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setRatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const convert = useCallback(
    (amount: number, from: CurrencyCode, to: CurrencyCode = currency) =>
      convertCurrency(amount, from, to, rates),
    [currency, rates]
  );

  const format = useCallback(
    (amount: number, from: CurrencyCode = BASE_CURRENCY) => {
      const target = currency;
      const converted = convertCurrency(amount, from, target, rates);
      return formatCurrency(converted, target);
    },
    [currency, rates]
  );

  const formatKes = useCallback(
    (amountKes: number) => formatFromKes(amountKes, currency, rates),
    [currency, rates]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      rates,
      ratesLoading,
      convert,
      format,
      formatKes,
    }),
    [currency, setCurrency, rates, ratesLoading, convert, format, formatKes]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
