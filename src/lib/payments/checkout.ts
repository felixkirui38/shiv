import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments/gateway";
import { createInvoiceForPayment, markInvoicePaid } from "@/lib/payments/invoices";
import { issueReceipt } from "@/lib/payments/receipts";
import type { CheckoutParams, CheckoutResult } from "@/lib/payments/types";
import type { PaymentPlanType, PaymentType } from "@/generated/prisma/client";

export async function createPaymentCheckout(
  params: CheckoutParams
): Promise<CheckoutResult> {
  const adapter = getPaymentProvider(params.provider);

  const payment = await prisma.payment.create({
    data: {
      userId: params.userId,
      quoteId: params.quoteId,
      applicationId: params.applicationId,
      orderId: params.orderId,
      policyId: params.policyId,
      invoiceId: params.invoiceId,
      type: params.type ?? mapPlanToType(params.planType),
      planType: params.planType ?? "ONE_TIME",
      provider: params.provider,
      status: params.provider === "MPESA" ? "PROCESSING" : "PENDING",
      amount: params.amount,
      currency: params.currency ?? "KES",
      description: params.description,
      installmentPlanId: params.installmentPlanId,
      installmentNumber: params.installmentNumber,
      installmentTotal: params.installmentTotal,
      metadata: params.metadata as object | undefined,
    },
  });

  const result = await adapter.createCheckout({ ...params, paymentId: payment.id });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerReference: result.providerReference,
      providerSessionId: result.providerSessionId,
      providerCheckoutUrl: result.checkoutUrl,
      stripeCheckoutId: params.provider === "STRIPE" ? result.providerSessionId : undefined,
      status: result.status ?? payment.status,
    },
  });

  return {
    paymentId: updated.id,
    checkoutUrl: result.checkoutUrl,
    providerReference: result.providerReference ?? undefined,
    providerSessionId: result.providerSessionId,
    status: updated.status,
    message: result.message,
  };
}

function mapPlanToType(plan?: PaymentPlanType): PaymentType {
  switch (plan) {
    case "SUBSCRIPTION":
      return "SUBSCRIPTION";
    case "INSTALLMENT":
      return "INSTALLMENT";
    case "ANNUAL":
      return "RENEWAL";
    default:
      return "ONE_TIME";
  }
}

export async function createInstallmentPlan(params: {
  userId: string;
  policyId?: string;
  quoteId?: string;
  totalAmount: number;
  installmentCount: number;
  frequency?: string;
}) {
  return prisma.paymentInstallmentPlan.create({
    data: {
      userId: params.userId,
      policyId: params.policyId,
      quoteId: params.quoteId,
      totalAmount: params.totalAmount,
      installmentCount: params.installmentCount,
      frequency: params.frequency ?? "monthly",
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function completePaymentSuccess(paymentId: string) {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "SUCCEEDED", paidAt: new Date() },
    include: { invoice: true, quote: true, policy: true, order: true, application: true },
  });

  if (payment.invoiceId) {
    await markInvoicePaid(payment.invoiceId);
  } else if (!payment.invoiceId) {
    await createInvoiceForPayment(payment.id);
  }

  await issueReceipt(payment.id);

  if (payment.quoteId) {
    await prisma.quote.update({
      where: { id: payment.quoteId },
      data: { status: "CONVERTED" },
    });
  }

  if (payment.orderId || payment.applicationId) {
    try {
      const { issuePolicyFromPayment } = await import("@/lib/purchase/policy-issuance");
      await issuePolicyFromPayment(paymentId);
    } catch (err) {
      console.error("Policy issuance failed:", err);
    }
  }

  if (payment.installmentPlanId) {
    const plan = await prisma.paymentInstallmentPlan.findUnique({
      where: { id: payment.installmentPlanId },
    });
    if (plan) {
      const paid = plan.paidInstallments + 1;
      await prisma.paymentInstallmentPlan.update({
        where: { id: plan.id },
        data: {
          paidInstallments: paid,
          status: paid >= plan.installmentCount ? "completed" : "active",
          nextDueDate:
            paid < plan.installmentCount
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
        },
      });
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payment.userId },
      select: { id: true, email: true, phone: true, firstName: true, lastName: true },
    });
    if (user) {
      const { emitPaymentReceived } = await import("@/lib/notifications");
      await emitPaymentReceived({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        customerName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
        amount: Number(payment.amount),
        description: payment.description ?? "Insurance premium",
        paymentReference: payment.providerReference ?? payment.id,
      });
    }
  } catch {
    // non-blocking
  }

  return payment;
}
