import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });
}

export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail?: string;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  mode: "payment" | "subscription";
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: params.lineItems,
    mode: params.mode,
    metadata: params.metadata,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
) {
  const stripe = getStripe();
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason,
  });
}

export function constructWebhookEvent(
  body: string,
  signature: string,
  secret: string
) {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, secret);
}
