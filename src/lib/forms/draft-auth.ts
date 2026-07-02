import { auth } from "@/lib/auth";
import { formDraftSessionSchema } from "@/validations/form-draft";

export interface DraftIdentity {
  userId?: string;
  sessionId?: string;
}

export async function resolveDraftIdentity(
  req: Request,
  body?: { sessionId?: string }
): Promise<DraftIdentity> {
  const session = await auth();
  const headerSessionId = req.headers.get("x-session-id") ?? undefined;
  const querySessionId = new URL(req.url).searchParams.get("sessionId") ?? undefined;
  const bodySessionId = body?.sessionId;

  const sessionId = [bodySessionId, headerSessionId, querySessionId].find((id) => {
    if (!id) return false;
    return formDraftSessionSchema.safeParse(id).success;
  });

  return {
    userId: session?.user?.id,
    sessionId,
  };
}

export function requireDraftIdentity(identity: DraftIdentity): string | null {
  if (identity.userId) return null;
  if (!identity.sessionId) {
    return "sessionId is required for guest drafts (header x-session-id, query param, or body)";
  }
  return null;
}
