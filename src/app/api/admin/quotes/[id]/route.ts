import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.QUOTES_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      policy: { select: { id: true, policyNumber: true, status: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, amount: true, status: true, provider: true, paidAt: true },
      },
    },
  });

  if (!quote) return apiError("Quote not found", 404);

  return apiSuccess({
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    status: quote.status,
    estimatedPremium: Number(quote.estimatedPremium),
    coverageAmount: quote.coverageAmount ? Number(quote.coverageAmount) : null,
    currentStep: quote.currentStep,
    customerEmail: quote.customerEmail,
    validUntil: quote.validUntil?.toISOString() ?? null,
    notes: quote.notes,
    pdfUrl: quote.pdfUrl,
    resumeToken: quote.resumeToken,
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
    product: quote.product,
    customer: quote.user
      ? {
          id: quote.user.id,
          email: quote.user.email,
          name: `${quote.user.firstName ?? ""} ${quote.user.lastName ?? ""}`.trim(),
          phone: quote.user.phone,
        }
      : quote.customerEmail
        ? { id: null, email: quote.customerEmail, name: quote.customerEmail, phone: null }
        : null,
    policy: quote.policy,
    payments: quote.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      paidAt: p.paidAt?.toISOString() ?? null,
    })),
  });
}
