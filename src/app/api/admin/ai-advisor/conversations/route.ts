import { requireAdmin } from "@/lib/admin/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { listAiConversations } from "@/lib/ai-advisor/queries";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.AI_ADVISOR_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? undefined;

  const data = await listAiConversations({ page, search });
  return apiSuccess(data);
}
