import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      application: {
        select: {
          id: true,
          applicationNumber: true,
          status: true,
          resumeToken: true,
          product: { select: { slug: true } },
        },
      },
      policy: {
        select: { id: true, policyNumber: true, status: true },
      },
      payments: {
        select: { id: true, status: true, amount: true, provider: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const items = orders.map((order) => ({
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
      productSlug: order.application.product.slug,
    },
    policy: order.policy,
    latestPayment: order.payments[0]
      ? {
          id: order.payments[0].id,
          status: order.payments[0].status,
          amount: Number(order.payments[0].amount),
          provider: order.payments[0].provider,
        }
      : null,
  }));

  return apiSuccess({ items });
}
