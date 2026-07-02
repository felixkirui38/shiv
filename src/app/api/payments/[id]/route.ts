import { auth } from "@/lib/auth";
import { getPaymentById } from "@/lib/payments/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  const payment = await getPaymentById(id, session.user.id);
  if (!payment) return apiError("Payment not found", 404);

  return apiSuccess(payment);
}
