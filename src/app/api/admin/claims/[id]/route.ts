import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getClaimById } from "@/lib/claims/queries";
import { prisma } from "@/lib/prisma";
import { updateClaimStatus } from "@/lib/claims/service";
import { notifyClaimStatusChange } from "@/lib/claims/notifications";
import { emitClaimApproved } from "@/lib/notifications";
import { apiSuccess, apiError } from "@/lib/api-response";
import {
  assignOfficerSchema,
  updateClaimStatusSchema,
} from "@/validations/claim";
import type { UserRole } from "@/generated/prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "claims:view")) {
    return apiError("Forbidden", 403);
  }

  const { id } = await params;
  const claim = await getClaimById(id, { staff: true });
  if (!claim) return apiError("Claim not found", 404);

  return apiSuccess(claim);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  const { id } = await params;
  const body = await req.json();

  try {
    if (body.assignedToId !== undefined) {
      if (!hasPermission(role, "claims:review")) {
        return apiError("Forbidden", 403);
      }
      const parsed = assignOfficerSchema.parse(body);
      const claim = await prisma.claim.update({
        where: { id },
        data: { assignedToId: parsed.assignedToId },
      });
      return apiSuccess({ id: claim.id, assignedToId: claim.assignedToId });
    }

    if (body.status) {
      if (!hasPermission(role, "claims:review")) {
        return apiError("Forbidden", 403);
      }
      if (
        ["APPROVED", "PARTIALLY_APPROVED", "REJECTED", "PAID"].includes(body.status) &&
        !hasPermission(role, "claims:approve")
      ) {
        return apiError("Forbidden", 403);
      }

      const parsed = updateClaimStatusSchema.parse(body);
      const existing = await prisma.claim.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        },
      });
      if (!existing) return apiError("Claim not found", 404);

      const updated = await updateClaimStatus({
        claimId: id,
        toStatus: parsed.status,
        changedBy: session.user.id,
        notes: parsed.notes,
        approvedAmount: parsed.approvedAmount,
        resolutionNotes: parsed.resolutionNotes,
      });

      const customerName =
        `${existing.user.firstName ?? ""} ${existing.user.lastName ?? ""}`.trim() ||
        existing.user.email;

      if (["APPROVED", "PARTIALLY_APPROVED"].includes(parsed.status)) {
        await emitClaimApproved({
          claimId: id,
          claimNumber: existing.claimNumber,
          customerUserId: existing.user.id,
          customerEmail: existing.user.email,
          customerPhone: existing.user.phone,
          customerName,
          message:
            parsed.notes ??
            `Your claim has been ${parsed.status === "PARTIALLY_APPROVED" ? "partially approved" : "approved"}.`,
        });
      } else {
        await notifyClaimStatusChange({
          claimId: id,
          claimNumber: existing.claimNumber,
          customerUserId: existing.user.id,
          customerEmail: existing.user.email,
          customerPhone: existing.user.phone,
          customerName,
          newStatus: parsed.status,
          message: parsed.notes,
          channels: ["EMAIL", "SMS", "WHATSAPP", "IN_APP"],
        });
      }

      return apiSuccess({ id: updated.id, status: updated.status });
    }

    return apiError("No valid update provided", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return apiError(message, 400);
  }
}
