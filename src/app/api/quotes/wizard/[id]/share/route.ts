import { getQuoteWizardById } from "@/lib/quote-wizard/service";
import {
  buildWhatsAppQuoteLink,
  emailQuoteToCustomer,
  getCustomerDisplayName,
} from "@/lib/quote-wizard/notify";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await getQuoteWizardById(id);
    if (!quote) return apiError("Quote not found", 404);

    const customer = quote.wizardData.customer;
    if (!customer?.email) return apiError("Customer email required", 400);

    const premium =
      quote.wizardData.premium?.result?.totalPremium ?? quote.estimatedPremium;

    await emailQuoteToCustomer({
      to: customer.email,
      quoteNumber: quote.quoteNumber,
      productName: quote.product?.name ?? quote.wizardData.insurance?.productName ?? "Insurance",
      premium,
      pdfUrl: quote.pdfUrl ?? quote.wizardData.pdf?.pdfUrl,
      resumeToken: quote.resumeToken,
      customerName: getCustomerDisplayName(quote.wizardData),
    });

    const whatsappUrl = buildWhatsAppQuoteLink({
      quoteNumber: quote.quoteNumber,
      productName: quote.product?.name ?? "Insurance",
      premium,
      customerName: getCustomerDisplayName(quote.wizardData),
    });

    return apiSuccess({ sent: true, whatsappUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return apiError(message, 400);
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quote = await getQuoteWizardById(id);
  if (!quote) return apiError("Quote not found", 404);

  const premium =
    quote.wizardData.premium?.result?.totalPremium ?? quote.estimatedPremium;

  const whatsappUrl = buildWhatsAppQuoteLink({
    quoteNumber: quote.quoteNumber,
    productName: quote.product?.name ?? "Insurance",
    premium,
    customerName: getCustomerDisplayName(quote.wizardData),
  });

  return apiSuccess({ whatsappUrl });
}
