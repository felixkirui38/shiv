import { requireAdmin } from "@/lib/admin/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getAiConversationDetail } from "@/lib/ai-advisor/queries";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.AI_ADVISOR_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const conversation = await getAiConversationDetail(id);
  if (!conversation) return apiError("Conversation not found", 404);

  return apiSuccess(conversation);
}
