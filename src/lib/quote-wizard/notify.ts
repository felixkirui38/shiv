import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import type { QuoteWizardData } from "@/types/quote-wizard";

import { buildWhatsAppQuoteLink as buildWaLink } from "@/lib/quote-wizard/share";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "info@shivinsbro.co.ke";

export function buildWhatsAppQuoteLink(params: {
  quoteNumber: string;
  productName: string;
  premium: number;
  customerName?: string;
}) {
  return buildWaLink(params);
}

export async function notifyAdminsNewQuote(params: {
  quoteId: string;
  quoteNumber: string;
  productName: string;
  customerEmail: string;
  customerName: string;
  premium: number;
}) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MANAGER"] }, status: "ACTIVE" },
    select: { id: true, email: true },
  });

  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: "IN_APP",
        title: "New Quote Request",
        message: `${params.customerName} requested a quote for ${params.productName} — KES ${params.premium.toLocaleString()}`,
        link: `/admin/leads`,
      },
    });
  }

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Quote: ${params.quoteNumber} — ${params.productName}`,
      html: `
        <h2>New Insurance Quote</h2>
        <p><strong>Quote:</strong> ${params.quoteNumber}</p>
        <p><strong>Product:</strong> ${params.productName}</p>
        <p><strong>Customer:</strong> ${params.customerName} (${params.customerEmail})</p>
        <p><strong>Premium:</strong> KES ${params.premium.toLocaleString()}</p>
        <p><a href="${APP_URL}/admin/leads">View in Admin</a></p>
      `,
    });
  } catch {
    // Email optional if Resend not configured
  }
}

export async function emailQuoteToCustomer(params: {
  to: string;
  quoteNumber: string;
  productName: string;
  premium: number;
  pdfUrl?: string;
  resumeToken: string;
  customerName: string;
}) {
  const resumeLink = `${APP_URL}/quote/resume/${params.resumeToken}`;

  await sendEmail({
    to: params.to,
    subject: `Your Insurance Quote — ${params.quoteNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #002B30;">Shiv Insurance Brokers</h2>
        <p>Dear ${params.customerName},</p>
        <p>Thank you for requesting a quote. Here are your quotation details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Quote Number</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${params.quoteNumber}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Product</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${params.productName}</td></tr>
          <tr><td style="padding: 8px;"><strong>Annual Premium</strong></td><td style="padding: 8px;">KES ${params.premium.toLocaleString()}</td></tr>
        </table>
        ${params.pdfUrl ? `<p><a href="${params.pdfUrl}" style="color: #0D3D42;">Download Quote PDF</a></p>` : ""}
        <p><a href="${resumeLink}" style="background: #C5A048; color: #002B30; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Resume Quote</a></p>
        <p style="color: #666; font-size: 12px;">This quote is valid for 30 days. A Shiv advisor may contact you shortly.</p>
      </div>
    `,
  });
}

export function getCustomerDisplayName(data: QuoteWizardData) {
  if (!data.customer) return "Customer";
  return `${data.customer.firstName} ${data.customer.lastName}`.trim();
}
