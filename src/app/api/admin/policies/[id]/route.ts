import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { emitPolicyApproved } from "@/lib/notifications";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.POLICIES_EDIT);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await ctx.params;
  const existing = await prisma.policy.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true } },
      product: { select: { name: true } },
    },
  });
  if (!existing) return apiError("Policy not found", 404);

  const body = await req.json();
  const newStatus = body.status as string | undefined;

  const policy = await prisma.policy.update({
    where: { id },
    data: {
      ...(newStatus ? { status: newStatus as never } : {}),
      ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
      ...(body.endDate ? { endDate: new Date(body.endDate) } : {}),
      ...(body.renewalDate ? { renewalDate: new Date(body.renewalDate) } : {}),
    },
    include: {
      user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true } },
      product: { select: { name: true } },
    },
  });

  if (newStatus === "ACTIVE" && existing.status !== "ACTIVE") {
    await emitPolicyApproved({
      userId: policy.user.id,
      email: policy.user.email,
      phone: policy.user.phone,
      customerName:
        `${policy.user.firstName ?? ""} ${policy.user.lastName ?? ""}`.trim() ||
        policy.user.email,
      policyNumber: policy.policyNumber,
      productName: policy.product.name,
      policyId: policy.id,
    });
  }

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "policy",
    entityId: id,
    oldData: existing,
    newData: policy,
  });

  return apiSuccess(policy);
}
