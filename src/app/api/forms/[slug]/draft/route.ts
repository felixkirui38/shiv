import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, rateLimitedResponse, RATE_LIMITS } from "@/lib/security/with-rate-limit";
import {
  deleteFormDraft,
  findFormDraft,
  getFormIdBySlug,
  upsertFormDraft,
} from "@/lib/forms/public";
import { requireDraftIdentity, resolveDraftIdentity } from "@/lib/forms/draft-auth";
import { mergeDraftPayload, saveFormDraftSchema } from "@/validations/form-draft";

type RouteCtx = { params: Promise<{ slug: string }> };

function serializeDraft(draft: {
  id: string;
  data: unknown;
  updatedAt: Date;
  expiresAt: Date | null;
}) {
  const data = (draft.data as Record<string, unknown>) ?? {};
  const { currentStep, ...values } = data;
  return {
    id: draft.id,
    data: values,
    currentStep: typeof currentStep === "number" ? currentStep : null,
    updatedAt: draft.updatedAt.toISOString(),
    expiresAt: draft.expiresAt?.toISOString() ?? null,
  };
}

export async function GET(req: Request, ctx: RouteCtx) {
  const limited = await checkRateLimit(req, RATE_LIMITS.formDraft);
  if (!limited.success) return rateLimitedResponse(limited);

  const { slug } = await ctx.params;
  const formId = await getFormIdBySlug(slug);
  if (!formId) return apiError("Form not found", 404);

  const identity = await resolveDraftIdentity(req);
  const identityError = requireDraftIdentity(identity);
  if (identityError) return apiError(identityError, 400);

  const draft = await findFormDraft({
    formId,
    userId: identity.userId,
    sessionId: identity.sessionId,
  });

  if (!draft) {
    return apiSuccess({ draft: null });
  }

  return apiSuccess({ draft: serializeDraft(draft) });
}

export async function POST(req: Request, ctx: RouteCtx) {
  const limited = await checkRateLimit(req, RATE_LIMITS.formDraft);
  if (!limited.success) return rateLimitedResponse(limited);

  const { slug } = await ctx.params;
  const formId = await getFormIdBySlug(slug);
  if (!formId) return apiError("Form not found", 404);

  try {
    const body = await req.json();
    const parsed = saveFormDraftSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid draft payload", 400);
    }

    const identity = await resolveDraftIdentity(req, parsed.data);
    const identityError = requireDraftIdentity(identity);
    if (identityError) return apiError(identityError, 400);

    const payload = mergeDraftPayload(parsed.data);
    if (Object.keys(payload).length === 0) {
      return apiError("Draft data is required", 400);
    }

    const draft = await upsertFormDraft({
      formId,
      userId: identity.userId,
      sessionId: identity.sessionId,
      data: payload,
    });

    return apiSuccess(serializeDraft(draft));
  } catch {
    return apiError("Failed to save draft", 500);
  }
}

export async function DELETE(req: Request, ctx: RouteCtx) {
  const limited = await checkRateLimit(req, RATE_LIMITS.formDraft);
  if (!limited.success) return rateLimitedResponse(limited);

  const { slug } = await ctx.params;
  const formId = await getFormIdBySlug(slug);
  if (!formId) return apiError("Form not found", 404);

  let body: { sessionId?: string } | undefined;
  try {
    body = await req.json();
  } catch {
    body = undefined;
  }

  const identity = await resolveDraftIdentity(req, body);
  const identityError = requireDraftIdentity(identity);
  if (identityError) return apiError(identityError, 400);

  const deleted = await deleteFormDraft({
    formId,
    userId: identity.userId,
    sessionId: identity.sessionId,
  });

  return apiSuccess({ deleted });
}
