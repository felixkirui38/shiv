import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { listFormSubmissions } from "@/lib/admin/form-submissions";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const form = await prisma.formDefinition.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true },
  });
  if (!form) return apiError("Form not found", 404);

  const { searchParams } = new URL(req.url);
  const { page, limit, search, export: doExport } = parseListParams(searchParams);

  const result = await listFormSubmissions(id, { page, limit, search });

  if (doExport) {
    const all = await listFormSubmissions(id, { page: 1, limit: 10000, search });
    return csvResponse(
      toCsv(all.items, [
        { key: "createdAt", label: "Submitted" },
        { key: "submittedBy", label: "Submitter" },
        { key: "email", label: "Email" },
        { key: "preview", label: "Preview" },
        { key: "status", label: "Status" },
      ]),
      `form-submissions-${form.slug}-${Date.now()}.csv`
    );
  }

  return apiSuccess({ form, ...result });
}
