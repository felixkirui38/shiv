import { requireAdmin } from "@/lib/admin/auth";
import { getAdminDashboard } from "@/lib/admin/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.REPORTS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const data = await getAdminDashboard();
  return apiSuccess(data);
}
