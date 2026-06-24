import { prisma } from "@/lib/prisma";

export async function getPortalDashboard(userId: string) {
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [
    activePolicies,
    openClaims,
    pendingPayments,
    renewalsDue,
    recentPayments,
    upcomingRenewals,
    unreadNotifications,
    user,
  ] = await Promise.all([
    prisma.policy.count({
      where: { userId, status: { in: ["ACTIVE", "RENEWED"] } },
    }),
    prisma.claim.count({
      where: {
        userId,
        status: { notIn: ["PAID", "CLOSED", "REJECTED", "DRAFT"] },
      },
    }),
    prisma.payment.aggregate({
      where: { userId, status: { in: ["PENDING", "PROCESSING"] } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.policy.count({
      where: {
        userId,
        status: { in: ["ACTIVE", "EXPIRED"] },
        OR: [{ renewalDate: { lte: in30Days } }, { endDate: { lte: in30Days } }],
      },
    }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { policy: { select: { policyNumber: true } } },
    }),
    prisma.policy.findMany({
      where: {
        userId,
        status: { in: ["ACTIVE", "EXPIRED"] },
        OR: [{ renewalDate: { lte: in30Days } }, { endDate: { lte: in30Days } }],
      },
      take: 3,
      include: { product: { select: { name: true } } },
      orderBy: { renewalDate: "asc" },
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    }),
  ]);

  return {
    user: {
      name:
        `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
        user?.email?.split("@")[0] ||
        "Customer",
      email: user?.email,
    },
    stats: {
      activePolicies,
      openClaims,
      premiumDue: Number(pendingPayments._sum.amount ?? 0),
      pendingPaymentCount: pendingPayments._count,
      renewalsDue,
    },
    unreadNotifications,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      description: p.description,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      policyNumber: p.policy?.policyNumber,
    })),
    upcomingRenewals: upcomingRenewals.map((p) => ({
      id: p.id,
      policyNumber: p.policyNumber,
      productName: p.product.name,
      premium: Number(p.premium),
      renewalDate: p.renewalDate?.toISOString() ?? p.endDate?.toISOString() ?? null,
    })),
  };
}

export async function listPortalPolicies(userId: string) {
  const policies = await prisma.policy.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true, icon: true } },
      documents: {
        include: { media: { select: { url: true, mimeType: true } } },
        take: 1,
      },
    },
  });

  return policies.map((p) => ({
    id: p.id,
    policyNumber: p.policyNumber,
    status: p.status,
    productName: p.product.name,
    productSlug: p.product.slug,
    productIcon: p.product.icon,
    premium: Number(p.premium),
    coverageAmount: p.coverageAmount ? Number(p.coverageAmount) : null,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    renewalDate: p.renewalDate?.toISOString() ?? null,
    autoRenew: p.autoRenew,
    hasCertificate: p.documents.length > 0,
  }));
}

export async function listPortalDocuments(userId: string) {
  const [policyDocs, claimDocs, invoices] = await Promise.all([
    prisma.policyDocument.findMany({
      where: { policy: { userId } },
      include: {
        policy: { select: { policyNumber: true } },
        media: { select: { url: true, mimeType: true, originalName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.claimDocument.findMany({
      where: { claim: { userId } },
      include: {
        claim: { select: { claimNumber: true } },
        media: { select: { url: true, mimeType: true, originalName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { userId, pdfUrl: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        pdfUrl: true,
        total: true,
        currency: true,
        createdAt: true,
      },
    }),
  ]);

  const items = [
    ...policyDocs.map((d) => ({
      id: d.id,
      name: d.name,
      type: "policy" as const,
      category: d.type,
      reference: d.policy.policyNumber,
      url: d.media.url,
      mimeType: d.media.mimeType,
      createdAt: d.createdAt.toISOString(),
    })),
    ...claimDocs.map((d) => ({
      id: d.id,
      name: d.name,
      type: "claim" as const,
      category: d.category,
      reference: d.claim.claimNumber,
      url: d.media.url,
      mimeType: d.media.mimeType,
      createdAt: d.createdAt.toISOString(),
    })),
    ...invoices.map((inv) => ({
      id: inv.id,
      name: `Invoice ${inv.invoiceNumber}`,
      type: "invoice" as const,
      category: "INVOICE",
      reference: inv.invoiceNumber,
      url: inv.pdfUrl!,
      mimeType: "application/pdf",
      createdAt: inv.createdAt.toISOString(),
      amount: Number(inv.total),
      currency: inv.currency,
    })),
  ];

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function listPortalNotifications(userId: string, limit = 50) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getPortalProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      address: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  if (!user) return null;

  return {
    ...user,
    dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    address: (user.address as Record<string, string> | null) ?? {},
    memberSince: user.createdAt.toISOString(),
  };
}
