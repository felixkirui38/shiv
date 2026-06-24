import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { listAdminClaims, listClaimsOfficers } from "@/lib/claims/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { UserRole } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "claims:view")) {
    return apiError("Forbidden", 403);
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get("officers") === "1") {
    const officers = await listClaimsOfficers();
    return apiSuccess(officers);
  }

  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? undefined;
  const assignedToId = searchParams.get("assignedToId") ?? undefined;

  const result = await listAdminClaims({ status, assignedToId, page });
  return apiSuccess(result);
}
