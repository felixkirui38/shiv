import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { isCloudinaryConfigured } from "@/lib/purchase/documents";
import { sendEmail } from "@/lib/resend";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, rateLimitedResponse, RATE_LIMITS } from "@/lib/security/with-rate-limit";
import { careerApplicationSchema } from "@/validations/career";

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const MAX_RESUME_MB = 5;

export async function POST(req: Request) {
  const limited = await checkRateLimit(req, RATE_LIMITS.careers);
  if (!limited.success) return rateLimitedResponse(limited);

  try {
    const formData = await req.formData();
    const parsed = careerApplicationSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      position: formData.get("position"),
      coverLetter: formData.get("coverLetter") || undefined,
    });

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid application", 400);
    }

    const resume = formData.get("resume") as File | null;
    let resumeId: string | undefined;

    if (resume && resume.size > 0) {
      if (
        !ALLOWED_RESUME_TYPES.includes(
          resume.type as (typeof ALLOWED_RESUME_TYPES)[number]
        )
      ) {
        return apiError("Resume must be PDF or Word document", 400);
      }

      if (resume.size > MAX_RESUME_MB * 1024 * 1024) {
        return apiError(`Resume must be under ${MAX_RESUME_MB}MB`, 400);
      }

      if (!isCloudinaryConfigured()) {
        return apiError("Resume upload is temporarily unavailable", 503);
      }

      const buffer = Buffer.from(await resume.arrayBuffer());
      const base64 = `data:${resume.type};base64,${buffer.toString("base64")}`;
      const upload = await uploadToCloudinary(base64, "shiv-insurance/careers");

      const media = await prisma.media.create({
        data: {
          filename: upload.public_id,
          originalName: resume.name,
          mimeType: resume.type,
          size: resume.size,
          type: "DOCUMENT",
          url: upload.secure_url,
          publicId: upload.public_id,
        },
      });
      resumeId = media.id;
    }

    const application = await prisma.careerApplication.create({
      data: {
        ...parsed.data,
        resumeId,
      },
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL ?? "admin@shivinsurance.com",
      subject: `Career application: ${parsed.data.position}`,
      html: `<p><strong>${parsed.data.firstName} ${parsed.data.lastName}</strong> applied for <strong>${parsed.data.position}</strong>.</p>
        <p>Email: ${parsed.data.email}</p>
        ${parsed.data.phone ? `<p>Phone: ${parsed.data.phone}</p>` : ""}
        ${parsed.data.coverLetter ? `<p>${parsed.data.coverLetter}</p>` : ""}`,
      replyTo: parsed.data.email,
    }).catch(() => undefined);

    return apiSuccess({ id: application.id }, 201);
  } catch (error) {
    console.error("[careers/apply]", error);
    return apiError("Failed to submit application", 500);
  }
}
