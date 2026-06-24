import type { PaymentProviderAdapter, WebhookPaymentUpdate } from "@/lib/payments/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getPesapalToken(): Promise<string> {
  const key = process.env.PESAPAL_CONSUMER_KEY;
  const secret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("Pesapal credentials not configured");

  const isLive = process.env.PESAPAL_ENV === "live";
  const base = isLive
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

  const res = await fetch(`${base}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Pesapal auth failed");
  return data.token as string;
}

export const pesapalProvider: PaymentProviderAdapter = {
  provider: "PESAPAL",

  async createCheckout(params) {
    const token = await getPesapalToken();
    const isLive = process.env.PESAPAL_ENV === "live";
    const base = isLive
      ? "https://pay.pesapal.com/v3"
      : "https://cybqa.pesapal.com/pesapalv3";

    const orderId = `PAY-${params.paymentId}`;

    const res = await fetch(`${base}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: orderId,
        currency: params.currency ?? "KES",
        amount: params.amount,
        description: params.description ?? "Insurance Premium",
        callback_url: `${APP_URL}/api/webhooks/pesapal`,
        notification_id: process.env.PESAPAL_IPN_ID,
        billing_address: {
          email_address: params.customerEmail,
          phone_number: params.customerPhone ?? "",
        },
      }),
    });

    const data = await res.json();
    if (!data.redirect_url) {
      throw new Error(data.message ?? "Pesapal order failed");
    }

    return {
      checkoutUrl: data.redirect_url as string,
      providerReference: orderId,
      providerSessionId: data.order_tracking_id as string | undefined,
      status: "PENDING",
    };
  },

  parseWebhook(body: unknown): WebhookPaymentUpdate | null {
    const data = body as {
      OrderNotificationType?: string;
      OrderTrackingId?: string;
      OrderMerchantReference?: string;
    };
    const ref = data.OrderMerchantReference ?? data.OrderTrackingId;
    if (!ref) return null;

    const status =
      data.OrderNotificationType === "IPNCHANGE" ||
      data.OrderNotificationType === "COMPLETED"
        ? "SUCCEEDED"
        : "FAILED";

    return {
      providerReference: ref,
      status,
      paidAt: status === "SUCCEEDED" ? new Date() : undefined,
    };
  },
};
