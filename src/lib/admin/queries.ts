import { prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [
    revenue,
    premiumCollected,
    claimsPaid,
    pendingClaims,
    customers,
    renewalsDue,
    products,
    recentLeads,
    recentClaims,
    recentPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED", type: { in: ["ONE_TIME", "RENEWAL", "INSTALLMENT"] } },
      _sum: { amount: true },
    }),
    prisma.claim.aggregate({
      where: { status: { in: ["PAID", "APPROVED", "PARTIALLY_APPROVED"] } },
      _sum: { approvedAmount: true },
    }),
    prisma.claim.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "INVESTIGATION", "DOCUMENTS_REQUESTED"] } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.policy.count({
      where: {
        status: { in: ["ACTIVE", "EXPIRED"] },
        OR: [{ renewalDate: { lte: in30Days } }, { endDate: { lte: in30Days } }],
      },
    }),
    prisma.insuranceProduct.count({ where: { isActive: true } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, email: true, status: true, createdAt: true },
    }),
    prisma.claim.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, claimNumber: true, status: true, claimAmount: true, createdAt: true },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { email: true } } },
    }),
  ]);

  return {
    stats: {
      revenue: Number(revenue._sum.amount ?? 0),
      premiumCollected: Number(premiumCollected._sum.amount ?? 0),
      claimsPaid: Number(claimsPaid._sum.approvedAmount ?? 0),
      pendingClaims,
      customers,
      renewalsDue,
      products,
    },
    recentLeads: recentLeads.map((l) => ({
      id: l.id,
      name: `${l.firstName} ${l.lastName ?? ""}`.trim(),
      email: l.email,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    })),
    recentClaims: recentClaims.map((c) => ({
      id: c.id,
      claimNumber: c.claimNumber,
      status: c.status,
      amount: Number(c.claimAmount),
      createdAt: c.createdAt.toISOString(),
    })),
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      customer: p.user.email,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}

export function parseListParams(searchParams: URLSearchParams) {
  return {
    page: Math.max(1, Number(searchParams.get("page") ?? 1)),
    limit: Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 25))),
    search: searchParams.get("search") ?? "",
    status: searchParams.get("status") ?? undefined,
    export: searchParams.get("export") === "csv",
  };
}
