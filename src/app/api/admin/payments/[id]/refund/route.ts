import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { processRefund } from "@/lib/payments/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { refundSchema } from "@/validations/payment";
import type { UserRole } from "@/generated/prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "payments:refund")) {
    return apiError("Forbidden", 403);
  }

  try {
    const { id } = await params;
    const body = refundSchema.parse(await req.json());
    const refund = await processRefund({
      paymentId: id,
      amount: body.amount,
      reason: body.reason,
      processedBy: session.user.id,
    });
    return apiSuccess(refund);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refund failed";
    return apiError(message, 400);
  }
}
