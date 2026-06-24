import { auth } from "@/lib/auth";
import { getPortalDashboard } from "@/lib/portal/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const data = await getPortalDashboard(session.user.id);
  return apiSuccess(data);
}
