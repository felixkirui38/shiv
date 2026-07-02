import type { PaymentProviderAdapter, WebhookPaymentUpdate } from "@/lib/payments/types";

async function getMpesaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("M-Pesa credentials not configured");

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const base =
    process.env.MPESA_ENV === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  const res = await fetch(
    `${base}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("M-Pesa auth failed");
  return data.access_token as string;
}

function mpesaPassword(shortcode: string, passkey: string): { password: string; timestamp: string } {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  return { password, timestamp };
}

export const mpesaProvider: PaymentProviderAdapter = {
  provider: "MPESA",

  async createCheckout(params) {
    if (!params.customerPhone) {
      throw new Error("Phone number required for M-Pesa payment");
    }

    const token = await getMpesaToken();
    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const { password, timestamp } = mpesaPassword(shortcode, passkey);
    const base =
      process.env.MPESA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const phone = params.customerPhone.replace(/\D/g, "").replace(/^0/, "254");

    const res = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(params.amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL:
          process.env.MPESA_CALLBACK_URL ??
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa`,
        AccountReference: params.paymentId.slice(0, 12),
        TransactionDesc: params.description ?? "Insurance Premium",
      }),
    });

    const data = await res.json();
    if (data.ResponseCode !== "0") {
      throw new Error(data.ResponseDescription ?? "M-Pesa STK push failed");
    }

    return {
      providerReference: data.CheckoutRequestID as string,
      providerSessionId: data.MerchantRequestID as string,
      status: "PROCESSING",
      message: "STK push sent to your phone. Enter your M-Pesa PIN to complete payment.",
    };
  },

  verifyWebhook(body: string, headers: Record<string, string>) {
    const secret = process.env.MPESA_WEBHOOK_SECRET;
    if (secret) {
      const provided =
        headers["x-mpesa-webhook-secret"] ??
        headers["authorization"]?.replace(/^Bearer\s+/i, "");
      if (provided !== secret) return false;
    } else if (process.env.NODE_ENV === "production") {
      return false;
    }

    try {
      const payload = JSON.parse(body) as {
        Body?: { stkCallback?: { CheckoutRequestID?: string } };
      };
      return Boolean(payload.Body?.stkCallback?.CheckoutRequestID);
    } catch {
      return false;
    }
  },

  parseWebhook(body: unknown): WebhookPaymentUpdate | null {
    const payload = body as {
      Body?: {
        stkCallback?: {
          CheckoutRequestID?: string;
          ResultCode?: number;
          ResultDesc?: string;
          CallbackMetadata?: {
            Item?: { Name: string; Value: unknown }[];
          };
        };
      };
    };

    const cb = payload.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) return null;

    const success = cb.ResultCode === 0;
    return {
      providerReference: cb.CheckoutRequestID,
      status: success ? "SUCCEEDED" : "FAILED",
      paidAt: success ? new Date() : undefined,
      failureReason: success ? undefined : cb.ResultDesc,
    };
  },
};
