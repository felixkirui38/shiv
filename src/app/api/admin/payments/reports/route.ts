import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getPaymentReports } from "@/lib/payments/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { UserRole } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "reports:view")) {
    return apiError("Forbidden", 403);
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const provider = searchParams.get("provider") ?? undefined;

  const reports = await getPaymentReports({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    provider,
  });

  return apiSuccess(reports);
}
