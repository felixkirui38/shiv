import { prisma } from "@/lib/prisma";
import type { ClaimTimelineEvent } from "@/lib/claims/types";
import { CLAIM_STATUS_LABELS, DOCUMENT_CATEGORY_LABELS } from "@/lib/claims/types";

const claimInclude = {
  policy: {
    select: {
      policyNumber: true,
      product: { select: { name: true } },
    },
  },
  user: {
    select: { id: true, email: true, firstName: true, lastName: true, phone: true },
  },
  assignedTo: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  documents: {
    include: { media: { select: { url: true, mimeType: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  statusHistory: { orderBy: { createdAt: "asc" as const } },
  notes: {
    include: {
      author: { select: { firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  communications: {
    include: {
      sentBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function listCustomerClaims(userId: string) {
  const claims = await prisma.claim.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      policy: { select: { policyNumber: true, product: { select: { name: true } } } },
      documents: { select: { id: true, category: true } },
    },
  });

  return claims.map(serializeClaimListItem);
}

export async function listAdminClaims(filters?: {
  status?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 25;
  const skip = (page - 1) * limit;

  const where = {
    ...(filters?.status ? { status: filters.status as never } : {}),
    ...(filters?.assignedToId ? { assignedToId: filters.assignedToId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.claim.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        policy: { select: { policyNumber: true, product: { select: { name: true } } } },
        user: { select: { email: true, firstName: true, lastName: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.claim.count({ where }),
  ]);

  return {
    items: items.map(serializeClaimListItem),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getClaimById(id: string, options?: { userId?: string; staff?: boolean }) {
  const claim = await prisma.claim.findFirst({
    where: {
      id,
      ...(options?.userId ? { userId: options.userId } : {}),
    },
    include: claimInclude,
  });

  if (!claim) return null;
  return serializeClaimDetail(claim, options?.staff ?? false);
}

export async function getCustomerPolicies(userId: string) {
  const policies = await prisma.policy.findMany({
    where: { userId, status: { in: ["ACTIVE", "RENEWED"] } },
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return policies.map((p) => ({
    id: p.id,
    policyNumber: p.policyNumber,
    productName: p.product.name,
    premium: Number(p.premium),
    endDate: p.endDate?.toISOString() ?? null,
  }));
}

export async function listClaimsOfficers() {
  return prisma.user.findMany({
    where: {
      role: { in: ["CLAIMS_OFFICER", "ADMIN", "MANAGER"] },
      status: "ACTIVE",
    },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
    orderBy: { firstName: "asc" },
  });
}

function buildTimeline(
  claim: {
    statusHistory: {
      id: string;
      fromStatus: string | null;
      toStatus: string;
      notes: string | null;
      changedBy: string | null;
      createdAt: Date;
    }[];
    notes: {
      id: string;
      content: string;
      isInternal: boolean;
      createdAt: Date;
      author: { firstName: string | null; lastName: string | null };
    }[];
    communications: {
      id: string;
      channel: string;
      subject: string | null;
      message: string;
      createdAt: Date;
      sentBy: { firstName: string | null; lastName: string | null } | null;
    }[];
  },
  staff: boolean
): ClaimTimelineEvent[] {
  const events: ClaimTimelineEvent[] = [];

  for (const h of claim.statusHistory) {
    events.push({
      id: h.id,
      type: "status",
      title: `Status: ${CLAIM_STATUS_LABELS[h.toStatus as keyof typeof CLAIM_STATUS_LABELS] ?? h.toStatus}`,
      description: h.notes ?? undefined,
      createdAt: h.createdAt.toISOString(),
    });
  }

  for (const n of claim.notes) {
    if (!staff && n.isInternal) continue;
    events.push({
      id: n.id,
      type: "note",
      title: "Note added",
      description: n.content,
      createdAt: n.createdAt.toISOString(),
      actor: `${n.author.firstName ?? ""} ${n.author.lastName ?? ""}`.trim(),
      isInternal: n.isInternal,
    });
  }

  for (const c of claim.communications) {
    events.push({
      id: c.id,
      type: "communication",
      title: `${c.channel} message`,
      description: c.subject ? `${c.subject}: ${c.message}` : c.message,
      createdAt: c.createdAt.toISOString(),
      actor: c.sentBy
        ? `${c.sentBy.firstName ?? ""} ${c.sentBy.lastName ?? ""}`.trim()
        : "System",
    });
  }

  return events.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function serializeClaimListItem(claim: {
  id: string;
  claimNumber: string;
  status: string;
  incidentDate: Date;
  reportedDate: Date;
  description: string;
  claimAmount: unknown;
  approvedAmount: unknown;
  createdAt: Date;
  policy: { policyNumber: string; product: { name: string } };
  user?: { email: string; firstName: string | null; lastName: string | null };
  assignedTo?: { firstName: string | null; lastName: string | null } | null;
  documents?: { id: string; category: string }[];
}) {
  return {
    id: claim.id,
    claimNumber: claim.claimNumber,
    status: claim.status,
    incidentDate: claim.incidentDate.toISOString(),
    reportedDate: claim.reportedDate.toISOString(),
    description: claim.description,
    claimAmount: Number(claim.claimAmount),
    approvedAmount: claim.approvedAmount ? Number(claim.approvedAmount) : null,
    createdAt: claim.createdAt.toISOString(),
    policyNumber: claim.policy.policyNumber,
    productName: claim.policy.product.name,
    customer: claim.user
      ? `${claim.user.firstName ?? ""} ${claim.user.lastName ?? ""}`.trim() ||
        claim.user.email
      : undefined,
    assignedOfficer: claim.assignedTo
      ? `${claim.assignedTo.firstName ?? ""} ${claim.assignedTo.lastName ?? ""}`.trim()
      : null,
    documentCount: claim.documents?.length ?? 0,
  };
}

function serializeClaimDetail(
  claim: {
    id: string;
    claimNumber: string;
    policyId: string;
    status: string;
    incidentDate: Date;
    reportedDate: Date;
    description: string;
    claimAmount: unknown;
    approvedAmount: unknown;
    resolutionNotes: string | null;
    resolvedAt: Date | null;
    assignedToId: string | null;
    createdAt: Date;
    updatedAt: Date;
    policy: { policyNumber: string; product: { name: string } };
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
    };
    assignedTo: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    } | null;
    documents: {
      id: string;
      name: string;
      type: string;
      category: string;
      createdAt: Date;
      media: { url: string; mimeType: string };
    }[];
    statusHistory: Parameters<typeof buildTimeline>[0]["statusHistory"];
    notes: Parameters<typeof buildTimeline>[0]["notes"];
    communications: Parameters<typeof buildTimeline>[0]["communications"];
  },
  staff: boolean
) {
  return {
    ...serializeClaimListItem({ ...claim, user: claim.user }),
    policyId: claim.policyId,
    resolutionNotes: claim.resolutionNotes,
    resolvedAt: claim.resolvedAt?.toISOString() ?? null,
    assignedToId: claim.assignedToId,
    updatedAt: claim.updatedAt.toISOString(),
    customer: {
      id: claim.user.id,
      name: `${claim.user.firstName ?? ""} ${claim.user.lastName ?? ""}`.trim(),
      email: claim.user.email,
      phone: claim.user.phone,
    },
    assignedOfficer: claim.assignedTo
      ? {
          id: claim.assignedTo.id,
          name: `${claim.assignedTo.firstName ?? ""} ${claim.assignedTo.lastName ?? ""}`.trim(),
          email: claim.assignedTo.email,
        }
      : null,
    documents: claim.documents.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      category: d.category,
      categoryLabel:
        DOCUMENT_CATEGORY_LABELS[d.category as keyof typeof DOCUMENT_CATEGORY_LABELS] ??
        d.category,
      url: d.media.url,
      mimeType: d.media.mimeType,
      createdAt: d.createdAt.toISOString(),
    })),
    timeline: buildTimeline(claim, staff),
  };
}
