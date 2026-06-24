const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254700652040";

export function buildWhatsAppQuoteLink(params: {
  quoteNumber: string;
  productName: string;
  premium: number;
  customerName?: string;
}) {
  const message =
    `Hello Shiv Insurance, I'd like to discuss my quote.\n\n` +
    `Quote: ${params.quoteNumber}\n` +
    `Product: ${params.productName}\n` +
    `Premium: KES ${params.premium.toLocaleString()}\n` +
    (params.customerName ? `Name: ${params.customerName}` : "");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
