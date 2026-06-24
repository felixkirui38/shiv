import type { PaymentPlanType, PaymentProvider, PaymentStatus, PaymentType } from "@/generated/prisma/client";

export interface CheckoutParams {
  userId: string;
  amount: number;
  currency?: string;
  provider: PaymentProvider;
  planType?: PaymentPlanType;
  type?: PaymentType;
  description?: string;
  customerEmail: string;
  customerPhone?: string;
  quoteId?: string;
  applicationId?: string;
  orderId?: string;
  policyId?: string;
  invoiceId?: string;
  installmentPlanId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  paymentId: string;
  checkoutUrl?: string;
  providerReference?: string;
  providerSessionId?: string;
  status: PaymentStatus;
  message?: string;
}

export interface WebhookPaymentUpdate {
  providerReference: string;
  status: PaymentStatus;
  paidAt?: Date;
  failureReason?: string;
  providerSessionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundParams {
  paymentId: string;
  amount?: number;
  reason?: string;
  processedBy?: string;
}

export interface PaymentProviderAdapter {
  provider: PaymentProvider;
  createCheckout(params: CheckoutParams & { paymentId: string }): Promise<{
    checkoutUrl?: string;
    providerReference?: string;
    providerSessionId?: string;
    status?: PaymentStatus;
    message?: string;
  }>;
  verifyWebhook?(body: string, headers: Record<string, string>): boolean;
  parseWebhook(body: unknown): WebhookPaymentUpdate | null;
  refund?(providerReference: string, amount: number): Promise<{ providerRefundId: string }>;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SUCCEEDED: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially Refunded",
  CANCELLED: "Cancelled",
};

export const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  STRIPE: "Stripe",
  PESAPAL: "Pesapal",
  FLUTTERWAVE: "Flutterwave",
  MPESA: "M-Pesa",
};
