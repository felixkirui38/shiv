import { auth } from "@/lib/auth";
import { listPayments } from "@/lib/payments/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? undefined;

  const result = await listPayments({
    userId: session.user.id,
    status,
    page,
    limit: 20,
  });

  return apiSuccess(result);
}
