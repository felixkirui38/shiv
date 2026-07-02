import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments/gateway";
import type { RefundParams } from "@/lib/payments/types";

export async function processRefund(params: RefundParams) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { refunds: true },
  });
  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "SUCCEEDED") {
    throw new Error("Only successful payments can be refunded");
  }

  const refundedTotal = payment.refunds.reduce((s, r) => s + Number(r.amount), 0);
  const refundAmount = params.amount ?? Number(payment.amount) - refundedTotal;
  if (refundAmount <= 0) throw new Error("Nothing to refund");

  const adapter = getPaymentProvider(payment.provider);
  let providerRefundId: string | undefined;

  if (adapter.refund && payment.providerReference) {
    const ref =
      payment.provider === "STRIPE"
        ? (payment.stripePaymentIntentId ?? payment.providerReference)
        : payment.providerReference;
    const result = await adapter.refund(ref, refundAmount);
    providerRefundId = result.providerRefundId;
  }

  const refund = await prisma.paymentRefund.create({
    data: {
      paymentId: payment.id,
      amount: refundAmount,
      reason: params.reason,
      provider: payment.provider,
      providerRefundId,
      stripeRefundId: payment.provider === "STRIPE" ? providerRefundId : undefined,
      processedBy: params.processedBy,
    },
  });

  const newRefundedTotal = refundedTotal + refundAmount;
  const fullRefund = newRefundedTotal >= Number(payment.amount);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: fullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
    },
  });

  return refund;
}

export async function getPaymentReports(filters?: {
  from?: Date;
  to?: Date;
  provider?: string;
}) {
  const where = {
    ...(filters?.from || filters?.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
    ...(filters?.provider ? { provider: filters.provider as never } : {}),
  };

  const [total, byStatus, byProvider, recent] = await Promise.all([
    prisma.payment.aggregate({
      where: { ...where, status: "SUCCEEDED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.groupBy({
      by: ["status"],
      where,
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["provider"],
      where,
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    }),
  ]);

  return {
    totalRevenue: Number(total._sum.amount ?? 0),
    successfulCount: total._count,
    byStatus: byStatus.map((s) => ({
      status: s.status,
      count: s._count,
      amount: Number(s._sum.amount ?? 0),
    })),
    byProvider: byProvider.map((p) => ({
      provider: p.provider,
      count: p._count,
      amount: Number(p._sum.amount ?? 0),
    })),
    recent,
  };
}

export async function listPayments(filters: {
  userId?: string;
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.status ? { status: filters.status as never } : {}),
    ...(filters.provider ? { provider: filters.provider as never } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        policy: { select: { policyNumber: true } },
        quote: { select: { quoteNumber: true } },
        receipt: true,
        invoice: { select: { invoiceNumber: true, pdfUrl: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    items: items.map(serializePayment),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPaymentById(paymentId: string, userId: string) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      policy: { select: { id: true, policyNumber: true, status: true } },
      quote: { select: { id: true, quoteNumber: true, status: true } },
      order: { select: { id: true, orderNumber: true, status: true } },
      invoice: { select: { id: true, invoiceNumber: true, pdfUrl: true, status: true } },
      receipt: true,
      refunds: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!payment) return null;

  const base = serializePayment(payment);
  return {
    ...base,
    policy: payment.policy,
    quote: payment.quote,
    order: payment.order,
    invoice: payment.invoice
      ? {
          id: payment.invoice.id,
          invoiceNumber: payment.invoice.invoiceNumber,
          status: payment.invoice.status,
          pdfUrl: payment.invoice.pdfUrl,
        }
      : null,
    refunds: payment.refunds.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      reason: r.reason,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function listSubscriptions(userId: string) {
  const items = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return items.map((s) => ({
    id: s.id,
    status: s.status,
    provider: s.provider,
    planType: s.planType,
    currentPeriodStart: s.currentPeriodStart?.toISOString() ?? null,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    cancelledAt: s.cancelledAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function listInvoices(userId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      lineItems: true,
      payments: { select: { id: true, status: true } },
    },
  });

  return invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status,
    total: Number(inv.total),
    currency: inv.currency,
    dueDate: inv.dueDate?.toISOString() ?? null,
    paidAt: inv.paidAt?.toISOString() ?? null,
    pdfUrl: inv.pdfUrl,
    createdAt: inv.createdAt.toISOString(),
    lineItems: inv.lineItems.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPrice: Number(l.unitPrice),
      total: Number(l.total),
    })),
  }));
}

function serializePayment(p: {
  id: string;
  type: string;
  planType: string;
  provider: string;
  status: string;
  amount: unknown;
  currency: string;
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
  receiptUrl: string | null;
  failureReason: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  user: { email: string; firstName: string | null; lastName: string | null };
  policy: { policyNumber: string } | null;
  quote: { quoteNumber: string } | null;
  receipt: { receiptNumber: string; pdfUrl: string | null } | null;
  invoice: { invoiceNumber: string; pdfUrl: string | null } | null;
}) {
  return {
    id: p.id,
    type: p.type,
    planType: p.planType,
    provider: p.provider,
    status: p.status,
    amount: Number(p.amount),
    currency: p.currency,
    description: p.description,
    paidAt: p.paidAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    receiptUrl: p.receiptUrl ?? p.receipt?.pdfUrl,
    receiptNumber: p.receipt?.receiptNumber,
    failureReason: p.failureReason,
    installmentNumber: p.installmentNumber,
    installmentTotal: p.installmentTotal,
    customer: `${p.user.firstName ?? ""} ${p.user.lastName ?? ""}`.trim() || p.user.email,
    policyNumber: p.policy?.policyNumber,
    quoteNumber: p.quote?.quoteNumber,
    invoiceNumber: p.invoice?.invoiceNumber,
    invoicePdfUrl: p.invoice?.pdfUrl,
  };
}

export { serializePayment };
