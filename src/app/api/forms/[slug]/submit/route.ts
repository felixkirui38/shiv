import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, rateLimitedResponse, RATE_LIMITS } from "@/lib/security/with-rate-limit";
import { deleteFormDraft, getFormIdBySlug } from "@/lib/forms/public";
import { resolveDraftIdentity } from "@/lib/forms/draft-auth";
import { submitPublicFormSchema } from "@/validations/form-draft";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, ctx: RouteCtx) {
  const limited = await checkRateLimit(req, RATE_LIMITS.formSubmit);
  if (!limited.success) return rateLimitedResponse(limited);

  const { slug } = await ctx.params;
  const formId = await getFormIdBySlug(slug);
  if (!formId) return apiError("Form not found", 404);

  try {
    const body = await req.json();
    const parsed = submitPublicFormSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid submission", 400);
    }

    const session = await auth();
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = req.headers.get("user-agent") ?? undefined;

    const submission = await prisma.formSubmission.create({
      data: {
        formId,
        userId: session?.user?.id,
        data: parsed.data.data as object,
        ipAddress,
        userAgent,
      },
    });

    const identity = await resolveDraftIdentity(req, parsed.data);
    await deleteFormDraft({
      formId,
      userId: identity.userId,
      sessionId: identity.sessionId,
    }).catch(() => undefined);

    return apiSuccess({ id: submission.id }, 201);
  } catch {
    return apiError("Failed to submit form", 500);
  }
}
