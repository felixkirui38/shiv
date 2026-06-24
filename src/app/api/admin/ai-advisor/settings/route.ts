import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getAiAdvisorSettings, saveAiAdvisorSettings } from "@/lib/ai-advisor/config";
import { PERMISSIONS } from "@/lib/permissions";
import { aiAdvisorSettingsSchema } from "@/validations/ai-advisor";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.AI_ADVISOR_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const settings = await getAiAdvisorSettings();
  return apiSuccess({
    ...settings,
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.AI_ADVISOR_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const parsed = aiAdvisorSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid settings", 400);
  }

  await saveAiAdvisorSettings(parsed.data);
  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "ai_advisor_settings",
    newData: { enabled: parsed.data.enabled },
  });

  return apiSuccess({ saved: true });
}
