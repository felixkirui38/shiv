import type { PaymentProviderAdapter, WebhookPaymentUpdate } from "@/lib/payments/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const flutterwaveProvider: PaymentProviderAdapter = {
  provider: "FLUTTERWAVE",

  async createCheckout(params) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) throw new Error("Flutterwave credentials not configured");

    const txRef = `FLW-${params.paymentId}-${Date.now()}`;

    const res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: params.amount,
        currency: params.currency ?? "KES",
        redirect_url: params.successUrl,
        customer: {
          email: params.customerEmail,
          phonenumber: params.customerPhone,
        },
        customizations: {
          title: "Shiv Insurance",
          description: params.description ?? "Insurance Premium",
        },
        meta: {
          paymentId: params.paymentId,
          userId: params.userId,
        },
      }),
    });

    const data = await res.json();
    if (data.status !== "success") {
      throw new Error(data.message ?? "Flutterwave initialization failed");
    }

    return {
      checkoutUrl: data.data.link as string,
      providerReference: txRef,
      status: "PENDING",
    };
  },

  verifyWebhook(body: string, headers: Record<string, string>) {
    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = headers["verif-hash"];
    if (!secret || !signature) return false;
    return signature === secret;
  },

  parseWebhook(body: unknown): WebhookPaymentUpdate | null {
    const payload = body as {
      event?: string;
      data?: { tx_ref?: string; status?: string; id?: number };
    };
    if (payload.event !== "charge.completed" || !payload.data?.tx_ref) return null;

    const success = payload.data.status === "successful";
    return {
      providerReference: payload.data.tx_ref,
      status: success ? "SUCCEEDED" : "FAILED",
      paidAt: success ? new Date() : undefined,
      failureReason: success ? undefined : payload.data.status,
    };
  },

  async refund(providerReference: string, amount: number) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY!;
    const res = await fetch("https://api.flutterwave.com/v3/transactions/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tx_ref: providerReference, amount }),
    });
    const data = await res.json();
    return { providerRefundId: String(data.data?.id ?? providerReference) };
  },
};
