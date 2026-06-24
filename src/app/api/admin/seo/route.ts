import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { getSeoCmsData, saveSeoCmsData } from "@/lib/seo";
import { seoCmsSchema } from "@/validations/seo";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.SEO_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const data = await getSeoCmsData();
  return apiSuccess(data);
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.SEO_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const parsed = seoCmsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid SEO data", 400);
  }

  await saveSeoCmsData(parsed.data);
  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "seo",
    newData: { keys: ["global", "pages"] },
  });

  return apiSuccess({ saved: true });
}
