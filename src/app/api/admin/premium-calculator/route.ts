import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getAllCalculatorConfigs } from "@/lib/premium-engine/queries";
import {
  getCalculationAuditLogs,
  getFormulaAuditLogs,
} from "@/lib/premium-engine/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { UserRole } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "products:manage")) {
    return apiError("Forbidden", 403);
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");

  if (view === "audit-calculations") {
    const productId = searchParams.get("productId") ?? undefined;
    const logs = await getCalculationAuditLogs({ productId, limit: 100 });
    return apiSuccess(logs);
  }

  if (view === "audit-formulas") {
    const logs = await getFormulaAuditLogs(100);
    return apiSuccess(logs);
  }

  const configs = await getAllCalculatorConfigs();
  return apiSuccess(configs);
}
