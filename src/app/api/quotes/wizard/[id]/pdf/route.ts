import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { generateQuotePdfBuffer } from "@/lib/quote-wizard/pdf";
import { getQuoteWizardById, updateQuoteWizardDraft } from "@/lib/quote-wizard/service";
import {
  emailQuoteToCustomer,
  getCustomerDisplayName,
} from "@/lib/quote-wizard/notify";
import { emitQuoteCreated } from "@/lib/notifications";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { QuoteWizardData } from "@/types/quote-wizard";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!quote) return apiError("Quote not found", 404);

    const wizardData = (quote.wizardData as QuoteWizardData) ?? {};
    const premium =
      wizardData.premium?.result?.totalPremium ?? Number(quote.estimatedPremium);

    const pdfBuffer = await generateQuotePdfBuffer({
      quoteNumber: quote.quoteNumber,
      productName: quote.product.name,
      estimatedPremium: premium,
      validUntil: quote.validUntil ?? new Date(Date.now() + 30 * 86400000),
      wizardData,
    });

    const base64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    const upload = await uploadToCloudinary(base64, `quotes/${id}/pdf`);

    const pdfUrl = upload.secure_url;
    const updatedWizardData: QuoteWizardData = {
      ...wizardData,
      pdf: { pdfUrl, generatedAt: new Date().toISOString() },
    };

    const updated = await updateQuoteWizardDraft(id, {
      pdfUrl,
      wizardData: updatedWizardData,
    });

    await prisma.quote.update({
      where: { id },
      data: { status: "SENT" },
    });

    if (wizardData.customer?.email) {
      try {
        await emailQuoteToCustomer({
          to: wizardData.customer.email,
          quoteNumber: quote.quoteNumber,
          productName: quote.product.name,
          premium,
          pdfUrl,
          resumeToken: quote.resumeToken ?? "",
          customerName: getCustomerDisplayName(wizardData),
        });
      } catch {
        // Email optional
      }

      await emitQuoteCreated({
        quoteId: id,
        quoteNumber: quote.quoteNumber,
        productName: quote.product.name,
        customerEmail: wizardData.customer.email,
        customerPhone: wizardData.customer.phone,
        customerName: getCustomerDisplayName(wizardData),
        premium,
        resumeToken: quote.resumeToken ?? "",
      });
    }

    return apiSuccess({ pdfUrl, quote: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed";
    return apiError(message, 400);
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quote = await getQuoteWizardById(id);
  if (!quote?.pdfUrl) return apiError("PDF not generated yet", 404);
  return apiSuccess({ pdfUrl: quote.pdfUrl });
}
