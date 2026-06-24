import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments/gateway";
import { completePaymentSuccess } from "@/lib/payments/checkout";
import type { PaymentProvider } from "@/generated/prisma/client";
import type { WebhookPaymentUpdate } from "@/lib/payments/types";

export async function logWebhookEvent(params: {
  provider: PaymentProvider;
  eventType: string;
  payload: unknown;
  externalId?: string;
  paymentId?: string;
  processed: boolean;
  error?: string;
}) {
  try {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: params.provider,
        eventType: params.eventType,
        externalId: params.externalId,
        paymentId: params.paymentId,
        payload: params.payload as object,
        processed: params.processed,
        error: params.error,
      },
    });
  } catch {
    // non-blocking
  }
}

export async function processWebhook(
  provider: PaymentProvider,
  body: unknown,
  headers: Record<string, string>,
  rawBody?: string
) {
  const adapter = getPaymentProvider(provider);

  if (adapter.verifyWebhook && rawBody && !adapter.verifyWebhook(rawBody, headers)) {
    await logWebhookEvent({
      provider,
      eventType: "signature_failed",
      payload: body,
      processed: false,
      error: "Invalid webhook signature",
    });
    throw new Error("Invalid webhook signature");
  }

  const update = adapter.parseWebhook(body);
  if (!update) {
    await logWebhookEvent({
      provider,
      eventType: "unhandled",
      payload: body,
      processed: false,
    });
    return { handled: false };
  }

  const payment = await findPaymentByReference(update, provider);

  await logWebhookEvent({
    provider,
    eventType: String((body as { type?: string }).type ?? "payment_update"),
    payload: body,
    externalId: update.providerReference,
    paymentId: payment?.id,
    processed: true,
  });

  if (!payment) return { handled: false, update };

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: update.status,
      paidAt: update.paidAt,
      failureReason: update.failureReason,
      stripePaymentIntentId: update.stripePaymentIntentId,
      stripeChargeId: update.stripeChargeId,
    },
  });

  if (update.status === "SUCCEEDED") {
    await completePaymentSuccess(payment.id);
  }

  if (update.status === "FAILED" && payment.quoteId) {
    // quote stays convertible on retry
  }

  return { handled: true, paymentId: payment.id };
}

async function findPaymentByReference(
  update: WebhookPaymentUpdate,
  provider: PaymentProvider
) {
  const metadata = update.metadata as { paymentId?: string } | undefined;
  if (metadata?.paymentId) {
    return prisma.payment.findUnique({ where: { id: metadata.paymentId } });
  }

  return prisma.payment.findFirst({
    where: {
      OR: [
        { providerReference: update.providerReference },
        { providerSessionId: update.providerReference },
        { stripeCheckoutId: update.providerReference },
      ],
      provider,
    },
  });
}
