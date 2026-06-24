import { createCheckoutSession } from "@/lib/stripe";
import type {
  CheckoutParams,
  PaymentProviderAdapter,
  WebhookPaymentUpdate,
} from "@/lib/payments/types";

export const stripeProvider: PaymentProviderAdapter = {
  provider: "STRIPE",

  async createCheckout(params: CheckoutParams & { paymentId: string }) {
    const session = await createCheckoutSession({
      customerEmail: params.customerEmail,
      lineItems: [
        {
          price_data: {
            currency: (params.currency ?? "KES").toLowerCase(),
            product_data: {
              name: params.description ?? "Insurance Premium",
            },
            unit_amount: Math.round(params.amount * 100),
            ...(params.planType === "SUBSCRIPTION"
              ? { recurring: { interval: "month" as const } }
              : {}),
          },
          quantity: 1,
        },
      ],
      mode: params.planType === "SUBSCRIPTION" ? "subscription" : "payment",
      metadata: {
        paymentId: params.paymentId,
        userId: params.userId,
        quoteId: params.quoteId ?? "",
        policyId: params.policyId ?? "",
        invoiceId: params.invoiceId ?? "",
        ...params.metadata,
      },
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    });

    return {
      checkoutUrl: session.url ?? undefined,
      providerReference: session.id,
      providerSessionId: session.id,
      status: "PENDING" as const,
    };
  },

  verifyWebhook(body: string, headers: Record<string, string>) {
    const sig = headers["stripe-signature"];
    return Boolean(sig && process.env.STRIPE_WEBHOOK_SECRET);
  },

  parseWebhook(body: unknown): WebhookPaymentUpdate | null {
    const event = body as { type: string; data: { object: Record<string, unknown> } };
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata as Record<string, string> | undefined;
      return {
        providerReference: session.id as string,
        status: "SUCCEEDED",
        paidAt: new Date(),
        providerSessionId: session.id as string,
        stripePaymentIntentId: session.payment_intent as string | undefined,
        metadata: { paymentId: metadata?.paymentId },
      };
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      return {
        providerReference: session.id as string,
        status: "FAILED",
        failureReason: "Checkout session expired",
      };
    }
    return null;
  },

  async refund(providerReference: string, amount: number) {
    const { createRefund } = await import("@/lib/stripe");
    const refund = await createRefund(providerReference, Math.round(amount * 100));
    return { providerRefundId: refund.id };
  },
};
