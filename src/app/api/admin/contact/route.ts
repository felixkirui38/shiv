import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.LEADS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const items = await prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" } });

  return apiSuccess({
    items: items.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      message: c.message.slice(0, 80) + (c.message.length > 80 ? "…" : ""),
      isRead: c.isRead,
      createdAt: c.createdAt.toISOString(),
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}
