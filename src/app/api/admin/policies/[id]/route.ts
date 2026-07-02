import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { emitPolicyApproved } from "@/lib/notifications";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.POLICIES_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await ctx.params;
  const policy = await prisma.policy.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
        },
      },
      product: { select: { id: true, name: true, slug: true } },
      application: { select: { id: true, applicationNumber: true, status: true } },
      order: { select: { id: true, orderNumber: true, status: true } },
      documents: {
        include: { media: { select: { id: true, url: true, originalName: true, mimeType: true } } },
      },
      _count: { select: { claims: true, payments: true, renewals: true } },
    },
  });

  if (!policy) return apiError("Policy not found", 404);

  return apiSuccess({
    id: policy.id,
    policyNumber: policy.policyNumber,
    status: policy.status,
    premium: Number(policy.premium),
    coverageAmount: policy.coverageAmount ? Number(policy.coverageAmount) : null,
    deductible: policy.deductible ? Number(policy.deductible) : null,
    startDate: policy.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: policy.endDate?.toISOString().slice(0, 10) ?? null,
    renewalDate: policy.renewalDate?.toISOString().slice(0, 10) ?? null,
    autoRenew: policy.autoRenew,
    formData: policy.formData,
    metadata: policy.metadata,
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString(),
    customer: {
      id: policy.user.id,
      name:
        `${policy.user.firstName ?? ""} ${policy.user.lastName ?? ""}`.trim() ||
        policy.user.email,
      email: policy.user.email,
      phone: policy.user.phone,
    },
    product: policy.product,
    application: policy.application,
    order: policy.order,
    documents: policy.documents.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      url: d.media.url,
      fileName: d.media.originalName,
      mimeType: d.media.mimeType,
    })),
    counts: policy._count,
  });
}

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
      ...(body.startDate !== undefined
        ? { startDate: body.startDate ? new Date(body.startDate) : null }
        : {}),
      ...(body.endDate !== undefined
        ? { endDate: body.endDate ? new Date(body.endDate) : null }
        : {}),
      ...(body.renewalDate !== undefined
        ? { renewalDate: body.renewalDate ? new Date(body.renewalDate) : null }
        : {}),
      ...(body.autoRenew !== undefined ? { autoRenew: Boolean(body.autoRenew) } : {}),
      ...(body.coverageAmount !== undefined
        ? { coverageAmount: body.coverageAmount }
        : {}),
      ...(body.deductible !== undefined ? { deductible: body.deductible } : {}),
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
