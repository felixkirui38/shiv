import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateClaimStatus } from "@/lib/claims/service";
import { emitClaimSubmitted } from "@/lib/notifications";
import { apiSuccess, apiError } from "@/lib/api-response";
import { submitClaimSchema } from "@/validations/claim";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    submitClaimSchema.parse(await req.json().catch(() => ({})));

    const claim = await prisma.claim.findFirst({
      where: { id, userId: session.user.id },
      include: {
        policy: { select: { policyNumber: true } },
        user: { select: { email: true, firstName: true, lastName: true, phone: true } },
      },
    });

    if (!claim) return apiError("Claim not found", 404);
    if (claim.status !== "DRAFT") return apiError("Claim already submitted", 400);

    const updated = await updateClaimStatus({
      claimId: id,
      toStatus: "SUBMITTED",
      changedBy: session.user.id,
      notes: "Claim submitted by customer",
    });

    const customerName =
      `${claim.user.firstName ?? ""} ${claim.user.lastName ?? ""}`.trim() ||
      claim.user.email;

    await emitClaimSubmitted({
      claimId: id,
      claimNumber: claim.claimNumber,
      policyNumber: claim.policy.policyNumber,
      customerUserId: session.user.id,
      customerEmail: claim.user.email,
      customerPhone: claim.user.phone,
      customerName,
    });

    return apiSuccess({ id: updated.id, status: updated.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submit failed";
    return apiError(message, 400);
  }
}
