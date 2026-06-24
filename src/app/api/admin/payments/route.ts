import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { listPayments } from "@/lib/payments/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { UserRole } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "payments:view")) {
    return apiError("Forbidden", 403);
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? undefined;
  const provider = searchParams.get("provider") ?? undefined;

  const result = await listPayments({ status, provider, page, limit: 25 });
  return apiSuccess(result);
}
