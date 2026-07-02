import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateCustomerSchema } from "@/validations/admin-customer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.CUSTOMERS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { policies: true, claims: true, orders: true, payments: true } },
      policies: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, policyNumber: true, status: true, createdAt: true },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true },
      },
    },
  });

  if (!user) return apiError("Customer not found", 404);

  return apiSuccess({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    phone: user.phone,
    status: user.status,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    counts: user._count,
    recentPolicies: user.policies.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    recentOrders: user.orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.CUSTOMERS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.user.findFirst({ where: { id, role: "CUSTOMER" } });
  if (!existing) return apiError("Customer not found", 404);

  const parsed = updateCustomerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "customer",
    entityId: id,
    oldData: existing,
    newData: user,
  });

  return apiSuccess(user);
}
