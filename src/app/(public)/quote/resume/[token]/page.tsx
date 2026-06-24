import { Suspense } from "react";
import { notFound } from "next/navigation";
import { QuoteWizard } from "@/components/quote-wizard/quote-wizard";
import { getQuoteWizardByToken } from "@/lib/quote-wizard/service";

export const metadata = { title: "Resume Quote | Shiv Insurance" };

export default async function ResumeQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { token } = await params;
  const { step } = await searchParams;
  const quote = await getQuoteWizardByToken(token);
  if (!quote) notFound();

  const initialQuote = step
    ? {
        ...quote,
        currentStep: Math.min(Math.max(parseInt(step, 10) || 1, 1), 8),
      }
    : quote;

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="mb-8 text-center">
        <div className="accent-bar mx-auto mb-4" />
        <h1 className="mb-2 font-heading text-3xl font-semibold text-dark">
          Resume Your Quote
        </h1>
        <p className="text-body">
          Welcome back — your draft <strong>{quote.quoteNumber}</strong> has been restored.
        </p>
      </div>
      <Suspense fallback={<div className="text-center text-body">Loading...</div>}>
        <QuoteWizard initialQuote={initialQuote} />
      </Suspense>
    </div>
  );
}
