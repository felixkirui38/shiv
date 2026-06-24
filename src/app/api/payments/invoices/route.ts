import { auth } from "@/lib/auth";
import { listInvoices } from "@/lib/payments/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const invoices = await listInvoices(session.user.id);
  return apiSuccess(invoices);
}
