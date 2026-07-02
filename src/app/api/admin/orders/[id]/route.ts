import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.PAYMENTS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      application: {
        select: {
          id: true,
          applicationNumber: true,
          status: true,
          totalPremium: true,
          formData: true,
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
          receiptNumber: true,
          failureReason: true,
        },
      },
    },
  });

  if (!order) return apiError("Order not found", 404);

  const formData = (order.application.formData as Record<string, unknown>) ?? {};

  return apiSuccess({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    insuranceName: order.insuranceName,
    coverageSummary: order.coverageSummary,
    subtotal: Number(order.subtotal),
    levies: Number(order.levies),
    taxes: Number(order.taxes),
    fees: Number(order.fees),
    stampDuty: Number(order.stampDuty),
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    paidAt: order.paidAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: order.user
      ? {
          id: order.user.id,
          name: `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() || order.user.email,
          email: order.user.email,
          phone: order.user.phone,
        }
      : {
          id: null,
          name: String(formData.fullName ?? formData.email ?? "Guest"),
          email: String(formData.email ?? "—"),
          phone: (formData.phone as string | undefined) ?? null,
        },
    application: {
      id: order.application.id,
      applicationNumber: order.application.applicationNumber,
      status: order.application.status,
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
      ...p,
      amount: Number(p.amount),
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}
