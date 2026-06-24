import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const in60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  const policies = await prisma.policy.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["ACTIVE", "EXPIRED"] },
      OR: [
        { renewalDate: { lte: in60Days } },
        { endDate: { lte: in60Days } },
      ],
    },
    include: {
      product: { select: { name: true, slug: true } },
    },
    orderBy: { renewalDate: "asc" },
  });

  return apiSuccess(
    policies.map((p) => ({
      id: p.id,
      policyNumber: p.policyNumber,
      productName: p.product.name,
      premium: Number(p.premium),
      renewalDate: p.renewalDate?.toISOString() ?? p.endDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
      status: p.status,
      autoRenew: p.autoRenew,
    }))
  );
}
