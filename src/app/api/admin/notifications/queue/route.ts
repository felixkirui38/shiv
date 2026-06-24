import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { listQueue, processNotificationQueue } from "@/lib/notifications";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.NOTIFICATIONS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, status } = parseListParams(searchParams);
  const result = await listQueue({ page, limit, status });
  return apiSuccess(result);
}

export async function POST() {
  const auth = await requireAdmin(PERMISSIONS.NOTIFICATIONS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const results = await processNotificationQueue(50);
  return apiSuccess({ processed: results.filter(Boolean).length, results });
}
