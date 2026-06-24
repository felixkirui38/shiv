import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendClaimCommunication } from "@/lib/claims/notifications";
import { apiSuccess, apiError } from "@/lib/api-response";
import { claimCommunicationSchema } from "@/validations/claim";
import type { UserRole } from "@/generated/prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "claims:review")) {
    return apiError("Forbidden", 403);
  }

  try {
    const { id } = await params;
    const body = claimCommunicationSchema.parse(await req.json());

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true } },
      },
    });
    if (!claim) return apiError("Claim not found", 404);

    const customerName =
      `${claim.user.firstName ?? ""} ${claim.user.lastName ?? ""}`.trim() ||
      claim.user.email;

    const comm = await sendClaimCommunication({
      claimId: id,
      customerUserId: claim.user.id,
      sentById: session.user.id,
      channel: body.channel,
      subject: body.subject,
      message: body.message,
      recipientEmail: claim.user.email,
      recipientPhone: claim.user.phone ?? undefined,
      customerName,
      claimNumber: claim.claimNumber,
    });

    return apiSuccess({
      id: comm.id,
      channel: comm.channel,
      status: comm.status,
      createdAt: comm.createdAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Communication failed";
    return apiError(message, 400);
  }
}
