import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!invoice) return apiError("Invoice not found", 404);

  if (invoice.pdfUrl) {
    return apiSuccess({ pdfUrl: invoice.pdfUrl });
  }

  const payment = await prisma.payment.findFirst({
    where: { invoiceId: id, userId: session.user.id },
    include: { receipt: true },
  });

  if (payment?.receipt?.pdfUrl) {
    return apiSuccess({ pdfUrl: payment.receipt.pdfUrl });
  }

  return apiError("PDF not available", 404);
}
