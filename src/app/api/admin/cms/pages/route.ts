import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { cmsPageSchema } from "@/validations/cms-page";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const items = await prisma.cmsPage.findMany({ orderBy: { updatedAt: "desc" } });

  return apiSuccess({
    items: items.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      isPublished: p.isPublished,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      updatedAt: p.updatedAt.toISOString(),
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const parsed = cmsPageSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const existing = await prisma.cmsPage.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return apiError("A page with this slug already exists", 409);

  const isPublished = parsed.data.isPublished ?? false;
  const page = await prisma.cmsPage.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      content: parsed.data.content,
      blocks: parsed.data.blocks as object | undefined,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "create",
    entity: "cmsPage",
    entityId: page.id,
    newData: page,
  });

  return apiSuccess(page, 201);
}
