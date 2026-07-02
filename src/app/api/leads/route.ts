import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import {
  createLeadSchema,
  resolveLeadProductType,
} from "@/validations/lead";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, rateLimitedResponse, RATE_LIMITS } from "@/lib/security/with-rate-limit";

export async function POST(req: Request) {
  const limited = await checkRateLimit(req, RATE_LIMITS.leads);
  if (!limited.success) return rateLimitedResponse(limited);

  try {
    const body = createLeadSchema.parse(await req.json());
    const email = body.email.trim().toLowerCase();
    const productType = resolveLeadProductType(body.productSlug, body.productType);
    const notes = [body.notes, body.message].filter(Boolean).join("\n\n") || undefined;

    const lead = await prisma.lead.create({
      data: {
        firstName: body.firstName.trim(),
        lastName: body.lastName?.trim(),
        email,
        phone: body.phone?.trim(),
        productType,
        source: body.source ?? "website",
        notes,
        metadata: body.productSlug ? { productSlug: body.productSlug } : undefined,
        status: "NEW",
      },
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL ?? "admin@shivinsurance.com",
      subject: `New lead: ${body.firstName} ${body.lastName ?? ""}`.trim(),
      html: `
        <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName ?? ""}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone ?? "—"}</p>
        <p><strong>Product:</strong> ${productType ?? body.productSlug ?? "Not specified"}</p>
        ${notes ? `<p><strong>Notes:</strong></p><p>${notes}</p>` : ""}
      `,
      replyTo: email,
    }).catch(() => undefined);

    return apiSuccess(
      {
        id: lead.id,
        message: "Thank you. A Shiv Insurance advisor will contact you shortly.",
      },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit lead";
    return apiError(message, 400);
  }
}
