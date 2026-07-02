import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  const subscription = await prisma.subscription.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!subscription) return apiError("Subscription not found", 404);
  if (subscription.status === "CANCELLED") {
    return apiError("Subscription is already cancelled", 400);
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: { cancelAtPeriodEnd: true },
  });

  return apiSuccess({
    id: updated.id,
    cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
    status: updated.status,
  });
}
