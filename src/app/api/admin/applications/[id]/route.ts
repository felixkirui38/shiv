import { requireAdmin } from "@/lib/admin/auth";
import {
  getAdminApplicationById,
  updateAdminApplication,
} from "@/lib/admin/applications";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.QUOTES_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const application = await getAdminApplicationById(id);
  if (!application) return apiError("Application not found", 404);

  return apiSuccess(application);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.QUOTES_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const body = (await req.json()) as {
    action: "approve" | "reject" | "request_documents";
    reason?: string;
    notes?: string;
  };

  if (!body.action) return apiError("action is required", 400);

  const updated = await updateAdminApplication(id, body.action, {
    reason: body.reason,
    notes: body.notes,
  });

  return apiSuccess(updated);
}
