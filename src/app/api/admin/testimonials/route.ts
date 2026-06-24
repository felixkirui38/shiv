import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.TESTIMONIALS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return apiSuccess({
    items: items.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      company: t.company,
      content: t.content.slice(0, 100) + (t.content.length > 100 ? "…" : ""),
      rating: t.rating,
      isActive: t.isActive,
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.TESTIMONIALS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const item = await prisma.testimonial.create({
    data: {
      name: body.name,
      role: body.role,
      company: body.company,
      content: body.content,
      rating: body.rating ?? 5,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  await logAudit({ userId: auth.session!.user!.id, action: "create", entity: "testimonial", entityId: item.id, newData: item });
  return apiSuccess(item, 201);
}
