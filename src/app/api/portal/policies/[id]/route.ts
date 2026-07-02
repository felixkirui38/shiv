import { auth } from "@/lib/auth";
import { getPortalPolicyById } from "@/lib/portal/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  const policy = await getPortalPolicyById(session.user.id, id);
  if (!policy) return apiError("Policy not found", 404);

  return apiSuccess(policy);
}
