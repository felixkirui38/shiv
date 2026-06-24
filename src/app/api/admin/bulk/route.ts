import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS, type Permission } from "@/lib/permissions";

const BULK_RESOURCES: Record<string, Permission> = {
  leads: PERMISSIONS.LEADS_MANAGE,
  faqs: PERMISSIONS.FAQ_MANAGE,
  testimonials: PERMISSIONS.TESTIMONIALS_MANAGE,
  partners: PERMISSIONS.PARTNERS_MANAGE,
  "blog-posts": PERMISSIONS.BLOG_MANAGE,
};

async function bulkDelete(resource: string, ids: string[]) {
  switch (resource) {
    case "leads":
      return prisma.lead.deleteMany({ where: { id: { in: ids } } });
    case "faqs":
      return prisma.faq.deleteMany({ where: { id: { in: ids } } });
    case "testimonials":
      return prisma.testimonial.deleteMany({ where: { id: { in: ids } } });
    case "partners":
      return prisma.partner.deleteMany({ where: { id: { in: ids } } });
    case "blog-posts":
      return prisma.blogPost.deleteMany({ where: { id: { in: ids } } });
    default:
      return null;
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { resource, ids, action } = body as {
    resource: string;
    ids: string[];
    action: string;
  };

  const permission = BULK_RESOURCES[resource];
  if (!permission) return apiError("Unknown resource", 400);

  const auth = await requireAdmin(permission);
  if (auth.error) return apiError(auth.error, auth.status);

  if (action !== "delete" || !ids?.length) {
    return apiError("Invalid bulk action", 400);
  }

  const result = await bulkDelete(resource, ids);
  if (!result) return apiError("Delete failed", 400);

  await logAudit({
    userId: auth.session!.user!.id,
    action: `bulk.${action}`,
    entity: resource,
    newData: { ids },
  });

  return apiSuccess({ deleted: ids.length });
}
