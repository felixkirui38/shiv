export const BASE_CURRENCY = "KES" as const;

export const CURRENCY_CONVERTER_LINK_HREF = "#currency-converter";

export type CurrencyCode =
  | typeof BASE_CURRENCY
  | "USD"
  | "EUR"
  | "GBP"
  | "UGX"
  | "TZS";

export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "UGX", label: "Ugandan Shilling", symbol: "USh" },
  { code: "TZS", label: "Tanzanian Shilling", symbol: "TSh" },
];

/** 1 KES → foreign currency. Updated via /api/currency/rates when available. */
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  KES: 1,
  USD: 0.0077,
  EUR: 0.0071,
  GBP: 0.0061,
  UGX: 28.5,
  TZS: 19.5,
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_OPTIONS.some((c) => c.code === value);
}

export function toKes(
  amount: number,
  from: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (from === BASE_CURRENCY) return amount;
  const rate = rates[from];
  if (!rate) return amount;
  return amount / rate;
}

export function fromKes(
  amountKes: number,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (to === BASE_CURRENCY) return amountKes;
  const rate = rates[to];
  if (!rate) return amountKes;
  return amountKes * rate;
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (from === to) return amount;
  return fromKes(toKes(amount, from, rates), to, rates);
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options?: { maximumFractionDigits?: number }
): string {
  const digits =
    currency === "KES" || currency === "UGX" || currency === "TZS" ? 0 : 2;

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: options?.maximumFractionDigits ?? digits,
    minimumFractionDigits: options?.minimumFractionDigits ?? digits,
  }).format(amount);
}

export function formatFromKes(
  amountKes: number,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, number>
): string {
  const converted = fromKes(amountKes, currency, rates);
  return formatCurrency(converted, currency);
}
