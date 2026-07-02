import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.LEADS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const items = await prisma.careerApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const resumeIds = items.map((i) => i.resumeId).filter(Boolean) as string[];
  const resumes =
    resumeIds.length > 0
      ? await prisma.media.findMany({
          where: { id: { in: resumeIds } },
          select: { id: true, url: true, originalName: true },
        })
      : [];
  const resumeMap = new Map(resumes.map((r) => [r.id, r]));

  return apiSuccess({
    items: items.map((a) => ({
      id: a.id,
      name: `${a.firstName} ${a.lastName}`,
      email: a.email,
      phone: a.phone ?? "",
      position: a.position,
      status: a.status,
      hasResume: Boolean(a.resumeId),
      resumeUrl: a.resumeId ? resumeMap.get(a.resumeId)?.url ?? null : null,
      createdAt: a.createdAt.toISOString(),
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}
