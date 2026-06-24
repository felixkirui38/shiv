import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import type { QuoteWizardData, QuoteWizardState } from "@/types/quote-wizard";
import { generateQuoteNumber } from "@/lib/quote-wizard/number";

export async function serializeQuoteWizard(quote: {
  id: string;
  quoteNumber: string;
  resumeToken: string | null;
  currentStep: number;
  status: string;
  wizardData: unknown;
  estimatedPremium: unknown;
  pdfUrl: string | null;
  product: { id: string; slug: string; name: string; category: string | null };
}): Promise<QuoteWizardState> {
  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    resumeToken: quote.resumeToken ?? "",
    currentStep: quote.currentStep,
    status: quote.status,
    wizardData: (quote.wizardData as QuoteWizardData) ?? {},
    estimatedPremium: Number(quote.estimatedPremium),
    pdfUrl: quote.pdfUrl,
    product: quote.product,
  };
}

export async function getQuoteWizardById(id: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, slug: true, name: true, category: true } },
        documents: { include: { media: true } },
      },
    });
    if (!quote) return null;

    const wizardData = (quote.wizardData as QuoteWizardData) ?? {};
    if (!wizardData.documents?.items?.length && quote.documents.length) {
      wizardData.documents = {
        items: quote.documents.map((d) => ({
          id: d.id,
          fileName: d.fileName,
          mimeType: d.mimeType,
          url: d.media.url,
          mediaId: d.mediaId,
        })),
      };
    }

    return serializeQuoteWizard({ ...quote, wizardData });
  } catch {
    return null;
  }
}

export async function getQuoteWizardByToken(token: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { resumeToken: token },
      include: {
        product: { select: { id: true, slug: true, name: true, category: true } },
        documents: { include: { media: true } },
      },
    });
    if (!quote || quote.status !== "DRAFT") return null;
    return serializeQuoteWizard(quote);
  } catch {
    return null;
  }
}

export async function createQuoteWizardDraft(params: {
  productId: string;
  sessionId?: string;
  userId?: string;
  prefill?: Partial<QuoteWizardData>;
}) {
  const product = await prisma.insuranceProduct.findUnique({
    where: { id: params.productId },
  });
  if (!product) throw new Error("Product not found");

  const quoteNumber = await generateQuoteNumber();
  const resumeToken = randomUUID();

  const wizardData: QuoteWizardData = {
    ...params.prefill,
    insurance: {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      category: product.category ?? undefined,
    },
  };

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      productId: product.id,
      userId: params.userId,
      sessionId: params.sessionId,
      resumeToken,
      currentStep: 1,
      status: "DRAFT",
      estimatedPremium: product.basePremium,
      wizardData: wizardData as object,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: {
      product: { select: { id: true, slug: true, name: true, category: true } },
    },
  });

  return serializeQuoteWizard(quote);
}

export async function updateQuoteWizardDraft(
  id: string,
  data: {
    currentStep?: number;
    wizardData?: QuoteWizardData;
    estimatedPremium?: number;
    customerEmail?: string;
    pdfUrl?: string;
    calculatorData?: object;
  }
) {
  const quote = await prisma.quote.update({
    where: { id },
    data: {
      currentStep: data.currentStep,
      wizardData: data.wizardData as object | undefined,
      estimatedPremium: data.estimatedPremium,
      customerEmail: data.customerEmail,
      pdfUrl: data.pdfUrl,
      calculatorData: data.calculatorData,
      updatedAt: new Date(),
    },
    include: {
      product: { select: { id: true, slug: true, name: true, category: true } },
    },
  });

  return serializeQuoteWizard(quote);
}

export async function findOrCreateCustomerUser(customer: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  let user = await prisma.user.findUnique({ where: { email: customer.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        role: "CUSTOMER",
        status: "PENDING_VERIFICATION",
      },
    });
  }
  return user;
}
