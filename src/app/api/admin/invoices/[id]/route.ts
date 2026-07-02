import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateInvoiceSchema } from "@/validations/admin-invoice";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.INVOICES_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      policy: { select: { id: true, policyNumber: true, status: true } },
      lineItems: true,
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          status: true,
          provider: true,
          paidAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!invoice) return apiError("Invoice not found", 404);

  return apiSuccess({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    subtotal: Number(invoice.subtotal),
    tax: Number(invoice.tax),
    total: Number(invoice.total),
    currency: invoice.currency,
    dueDate: invoice.dueDate?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
    pdfUrl: invoice.pdfUrl,
    notes: invoice.notes,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    customer: {
      id: invoice.user.id,
      email: invoice.user.email,
      name: `${invoice.user.firstName ?? ""} ${invoice.user.lastName ?? ""}`.trim() || invoice.user.email,
      phone: invoice.user.phone,
    },
    policy: invoice.policy,
    lineItems: invoice.lineItems.map((l) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unitPrice: Number(l.unitPrice),
      total: Number(l.total),
    })),
    payments: invoice.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.INVOICES_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return apiError("Invoice not found", 404);

  const parsed = updateInvoiceSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const { dueDate, ...rest } = parsed.data;
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "invoice",
    entityId: id,
    oldData: existing,
    newData: invoice,
  });

  return apiSuccess(invoice);
}
