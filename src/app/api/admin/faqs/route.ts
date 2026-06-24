import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { parseListParams } from "@/lib/admin/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.FAQ_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { search } = parseListParams(searchParams);

  const items = await prisma.faq.findMany({
    where: search
      ? { question: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return apiSuccess({
    items: items.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer.slice(0, 120) + (f.answer.length > 120 ? "…" : ""),
      category: f.category,
      isActive: f.isActive,
      sortOrder: f.sortOrder,
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.FAQ_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const faq = await prisma.faq.create({
    data: {
      question: body.question,
      answer: body.answer,
      category: body.category,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  await logAudit({ userId: auth.session!.user!.id, action: "create", entity: "faq", entityId: faq.id, newData: faq });
  return apiSuccess(faq, 201);
}
