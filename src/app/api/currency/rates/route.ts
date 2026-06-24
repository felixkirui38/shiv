import { apiSuccess } from "@/lib/api-response";
import {
  BASE_CURRENCY,
  CURRENCY_OPTIONS,
  FALLBACK_RATES,
  type CurrencyCode,
} from "@/lib/currency";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const TARGETS = CURRENCY_OPTIONS.map((c) => c.code).filter(
  (c) => c !== BASE_CURRENCY
);

async function fetchLiveRates(): Promise<Record<CurrencyCode, number> | null> {
  const url = `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${TARGETS.join(",")}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = (await res.json()) as { rates?: Record<string, number> };
    if (!json.rates) return null;

    const rates = { ...FALLBACK_RATES, [BASE_CURRENCY]: 1 };
    for (const code of TARGETS) {
      const value = json.rates[code];
      if (typeof value === "number" && value > 0) {
        rates[code] = value;
      }
    }
    return rates;
  } catch {
    return null;
  }
}

export async function GET() {
  const live = await fetchLiveRates();
  const rates = live ?? FALLBACK_RATES;

  return apiSuccess({
    base: BASE_CURRENCY,
    rates,
    source: live ? "live" : "fallback",
    updatedAt: new Date().toISOString(),
  });
}
