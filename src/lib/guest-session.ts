export const DEFAULT_FORM_SESSION_KEY = "shiv_form_session";

export function getOrCreateGuestSessionId(
  storageKey = DEFAULT_FORM_SESSION_KEY
): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(storageKey);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(storageKey, id);
  }
  return id;
}

export function clearGuestSessionId(storageKey = DEFAULT_FORM_SESSION_KEY) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}
