import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { listLogs } from "@/lib/notifications";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.NOTIFICATIONS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, status } = parseListParams(searchParams);
  const event = searchParams.get("event") ?? undefined;
  const result = await listLogs({ page, limit, status, event });
  return apiSuccess(result);
}
