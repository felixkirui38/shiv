import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, rateLimitedResponse, RATE_LIMITS } from "@/lib/security/with-rate-limit";

export async function POST(req: Request) {
  const limited = await checkRateLimit(req, RATE_LIMITS.contact);
  if (!limited.success) return rateLimitedResponse(limited);

  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return apiError("Name, email, and message are required");
    }

    const submission = await prisma.contactSubmission.create({
      data: { name, email, phone, subject, message },
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL ?? "admin@shivinsurance.com",
      subject: `Contact: ${subject ?? "New inquiry"}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
      replyTo: email,
    });

    return apiSuccess(submission, 201);
  } catch {
    return apiError("Failed to submit contact form", 500);
  }
}
