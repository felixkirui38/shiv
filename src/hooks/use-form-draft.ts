"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deletePublicFormDraft,
  loadPublicFormDraft,
  savePublicFormDraft,
  type PublicFormDraft,
} from "@/lib/forms/client";

interface UseFormDraftOptions {
  slug: string;
  enabled?: boolean;
  debounceMs?: number;
  storageKey?: string;
  onLoaded?: (draft: PublicFormDraft | null) => void;
}

export function useFormDraft({
  slug,
  enabled = true,
  debounceMs = 800,
  storageKey,
  onLoaded,
}: UseFormDraftOptions) {
  const [draft, setDraft] = useState<PublicFormDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !slug) return;
    setLoading(true);
    setError(null);
    const res = await loadPublicFormDraft(slug, { storageKey });
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "Failed to load draft");
      return;
    }
    const loaded = res.data?.draft ?? null;
    setDraft(loaded);
    onLoaded?.(loaded);
  }, [enabled, slug, storageKey, onLoaded]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (data: Record<string, unknown>, currentStep?: number) => {
      if (!enabled || !slug) return;
      setSaving(true);
      setError(null);
      const res = await savePublicFormDraft(
        slug,
        { data, currentStep },
        { storageKey }
      );
      setSaving(false);
      if (!res.success) {
        setError(res.error ?? "Failed to save draft");
        return false;
      }
      if (res.data) setDraft(res.data);
      return true;
    },
    [enabled, slug, storageKey]
  );

  const queueSave = useCallback(
    (data: Record<string, unknown>, currentStep?: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void save(data, currentStep);
      }, debounceMs);
    },
    [debounceMs, save]
  );

  const clear = useCallback(async () => {
    if (!slug) return;
    await deletePublicFormDraft(slug, { storageKey });
    setDraft(null);
  }, [slug, storageKey]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    draft,
    loading,
    saving,
    error,
    load,
    save,
    queueSave,
    clear,
  };
}
