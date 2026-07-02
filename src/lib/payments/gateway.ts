import type { PaymentProvider } from "@/generated/prisma/client";
import type { PaymentProviderAdapter } from "@/lib/payments/types";
import { stripeProvider } from "@/lib/payments/providers/stripe";
import { pesapalProvider } from "@/lib/payments/providers/pesapal";
import { flutterwaveProvider } from "@/lib/payments/providers/flutterwave";
import { mpesaProvider } from "@/lib/payments/providers/mpesa";

const providers: Record<PaymentProvider, PaymentProviderAdapter> = {
  STRIPE: stripeProvider,
  PESAPAL: pesapalProvider,
  FLUTTERWAVE: flutterwaveProvider,
  MPESA: mpesaProvider,
};

export function getPaymentProvider(provider: PaymentProvider): PaymentProviderAdapter {
  return providers[provider];
}

export function getAvailableProviders(): PaymentProvider[] {
  const available: PaymentProvider[] = [];
  if (process.env.STRIPE_SECRET_KEY) available.push("STRIPE");
  if (process.env.PESAPAL_CONSUMER_KEY) available.push("PESAPAL");
  if (process.env.FLUTTERWAVE_SECRET_KEY) available.push("FLUTTERWAVE");
  if (process.env.MPESA_CONSUMER_KEY) available.push("MPESA");
  return available;
}
