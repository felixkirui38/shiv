import { getOrCreateGuestSessionId } from "@/lib/guest-session";

export interface PublicFormDraft {
  id: string;
  data: Record<string, unknown>;
  currentStep: number | null;
  updatedAt: string;
  expiresAt: string | null;
}

export interface PublicFormClientOptions {
  sessionId?: string;
  storageKey?: string;
}

function draftHeaders(sessionId?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (sessionId) headers["x-session-id"] = sessionId;
  return headers;
}

function resolveSessionId(options?: PublicFormClientOptions) {
  return options?.sessionId ?? getOrCreateGuestSessionId(options?.storageKey);
}

export async function fetchPublicForm(slug: string) {
  const res = await fetch(`/api/forms/${slug}`);
  return res.json() as Promise<{ success: boolean; data?: unknown; error?: string }>;
}

export async function loadPublicFormDraft(
  slug: string,
  options?: PublicFormClientOptions
) {
  const sessionId = resolveSessionId(options);
  const res = await fetch(`/api/forms/${slug}/draft?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: draftHeaders(sessionId),
  });
  return res.json() as Promise<{
    success: boolean;
    data?: { draft: PublicFormDraft | null; expired?: boolean };
    error?: string;
  }>;
}

export async function savePublicFormDraft(
  slug: string,
  payload: {
    data?: Record<string, unknown>;
    currentStep?: number;
    sessionId?: string;
  },
  options?: PublicFormClientOptions
) {
  const sessionId = payload.sessionId ?? resolveSessionId(options);
  const res = await fetch(`/api/forms/${slug}/draft`, {
    method: "POST",
    headers: draftHeaders(sessionId),
    body: JSON.stringify({
      sessionId,
      data: payload.data,
      currentStep: payload.currentStep,
    }),
  });
  return res.json() as Promise<{
    success: boolean;
    data?: PublicFormDraft;
    error?: string;
  }>;
}

export async function deletePublicFormDraft(
  slug: string,
  options?: PublicFormClientOptions
) {
  const sessionId = resolveSessionId(options);
  const res = await fetch(`/api/forms/${slug}/draft`, {
    method: "DELETE",
    headers: draftHeaders(sessionId),
    body: JSON.stringify({ sessionId }),
  });
  return res.json() as Promise<{ success: boolean; data?: { deleted: boolean }; error?: string }>;
}

export async function submitPublicForm(
  slug: string,
  data: Record<string, unknown>,
  options?: PublicFormClientOptions
) {
  const sessionId = resolveSessionId(options);
  const res = await fetch(`/api/forms/${slug}/submit`, {
    method: "POST",
    headers: draftHeaders(sessionId),
    body: JSON.stringify({ sessionId, data }),
  });
  const result = (await res.json()) as {
    success: boolean;
    data?: { id: string };
    error?: string;
  };

  if (result.success) {
    await deletePublicFormDraft(slug, { sessionId, storageKey: options?.storageKey }).catch(
      () => undefined
    );
  }

  return result;
}
