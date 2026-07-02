import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      application: {
        select: {
          id: true,
          applicationNumber: true,
          status: true,
          resumeToken: true,
          totalPremium: true,
          product: { select: { slug: true, name: true } },
        },
      },
      policy: {
        select: { id: true, policyNumber: true, status: true, startDate: true, endDate: true },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          provider: true,
          description: true,
          paidAt: true,
          createdAt: true,
          receiptUrl: true,
          failureReason: true,
          receipt: { select: { receiptNumber: true } },
        },
      },
    },
  });

  if (!order) return apiError("Order not found", 404);

  return apiSuccess({
    id: order.id,
    orderNumber: order.orderNumber,
    insuranceName: order.insuranceName,
    coverageSummary: order.coverageSummary,
    status: order.status,
    subtotal: Number(order.subtotal),
    levies: Number(order.levies),
    taxes: Number(order.taxes),
    stampDuty: Number(order.stampDuty),
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    paidAt: order.paidAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    application: {
      id: order.application.id,
      applicationNumber: order.application.applicationNumber,
      status: order.application.status,
      resumeToken: order.application.resumeToken,
      totalPremium: Number(order.application.totalPremium),
      productSlug: order.application.product.slug,
      productName: order.application.product.name,
    },
    policy: order.policy
      ? {
          ...order.policy,
          startDate: order.policy.startDate?.toISOString() ?? null,
          endDate: order.policy.endDate?.toISOString() ?? null,
        }
      : null,
    payments: order.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      provider: p.provider,
      description: p.description,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      receiptUrl: p.receiptUrl,
      receiptNumber: p.receipt?.receiptNumber ?? null,
      failureReason: p.failureReason,
    })),
  });
}
