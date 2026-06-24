import { auth } from "@/lib/auth";
import { listPortalPolicies } from "@/lib/portal/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const policies = await listPortalPolicies(session.user.id);
  return apiSuccess(policies);
}
