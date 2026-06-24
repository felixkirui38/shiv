import { prisma } from "@/lib/prisma";
import type { ClaimStatus } from "@/generated/prisma/client";

export async function generateClaimNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.claim.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  });
  return `CLM-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function recordStatusChange(params: {
  claimId: string;
  fromStatus: ClaimStatus | null;
  toStatus: ClaimStatus;
  changedBy?: string;
  notes?: string;
}) {
  return prisma.claimStatusHistory.create({
    data: {
      claimId: params.claimId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      changedBy: params.changedBy,
      notes: params.notes,
    },
  });
}

export async function updateClaimStatus(params: {
  claimId: string;
  toStatus: ClaimStatus;
  changedBy?: string;
  notes?: string;
  approvedAmount?: number;
  resolutionNotes?: string;
}) {
  const claim = await prisma.claim.findUnique({ where: { id: params.claimId } });
  if (!claim) throw new Error("Claim not found");

  const updated = await prisma.claim.update({
    where: { id: params.claimId },
    data: {
      status: params.toStatus,
      approvedAmount: params.approvedAmount,
      resolutionNotes: params.resolutionNotes,
      resolvedAt:
        params.toStatus === "APPROVED" ||
        params.toStatus === "REJECTED" ||
        params.toStatus === "PAID" ||
        params.toStatus === "CLOSED"
          ? new Date()
          : undefined,
      reviewedById:
        params.toStatus === "APPROVED" ||
        params.toStatus === "REJECTED" ||
        params.toStatus === "PARTIALLY_APPROVED"
          ? params.changedBy
          : undefined,
    },
    include: {
      user: true,
      policy: { include: { product: true } },
      assignedTo: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  await recordStatusChange({
    claimId: params.claimId,
    fromStatus: claim.status,
    toStatus: params.toStatus,
    changedBy: params.changedBy,
    notes: params.notes,
  });

  return updated;
}
