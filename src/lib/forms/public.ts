import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import type { CmsFormDefinition, CmsFormField } from "@/types/purchase";

export function serializeFormDefinition(
  form: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    settings: unknown;
    fields: {
      id: string;
      key: string;
      label: string;
      type: string;
      placeholder: string | null;
      helpText: string | null;
      isRequired: boolean;
      sortOrder: number;
      options: unknown;
      validation: unknown;
      defaultValue: string | null;
    }[];
  }
): CmsFormDefinition {
  return {
    id: form.id,
    slug: form.slug,
    name: form.name,
    description: form.description,
    settings: form.settings as CmsFormDefinition["settings"],
    fields: form.fields.map((f) => ({
      id: f.id,
      key: f.key,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder,
      helpText: f.helpText,
      isRequired: f.isRequired,
      sortOrder: f.sortOrder,
      options: f.options,
      validation: f.validation as CmsFormField["validation"],
      defaultValue: f.defaultValue,
    })),
  };
}

const formInclude = {
  fields: { orderBy: { sortOrder: "asc" as const } },
} as const;

export async function getPublicFormBySlug(slug: string): Promise<CmsFormDefinition | null> {
  try {
    const form = await withDbRetry(() =>
      prisma.formDefinition.findFirst({
        where: { slug, isActive: true },
        include: formInclude,
        orderBy: { version: "desc" },
      })
    );
    if (!form) return null;
    return serializeFormDefinition(form);
  } catch {
    return null;
  }
}

export async function getFormIdBySlug(slug: string): Promise<string | null> {
  const form = await prisma.formDefinition.findFirst({
    where: { slug, isActive: true },
    select: { id: true },
    orderBy: { version: "desc" },
  });
  return form?.id ?? null;
}

const DRAFT_TTL_DAYS = 30;

export function draftExpiresAt() {
  return new Date(Date.now() + DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function findFormDraft(params: {
  formId: string;
  userId?: string | null;
  sessionId?: string | null;
}) {
  let draft = null;

  if (params.userId) {
    draft = await prisma.formDraft.findFirst({
      where: { formId: params.formId, userId: params.userId },
      orderBy: { updatedAt: "desc" },
    });
  } else if (params.sessionId) {
    draft = await prisma.formDraft.findFirst({
      where: { formId: params.formId, sessionId: params.sessionId },
      orderBy: { updatedAt: "desc" },
    });
  }

  if (draft?.expiresAt && draft.expiresAt < new Date()) {
    await prisma.formDraft.delete({ where: { id: draft.id } }).catch(() => undefined);
    return null;
  }

  return draft;
}

export async function upsertFormDraft(params: {
  formId: string;
  userId?: string | null;
  sessionId?: string | null;
  data: Record<string, unknown>;
}) {
  const existing = await findFormDraft(params);
  const expiresAt = draftExpiresAt();

  if (existing) {
    return prisma.formDraft.update({
      where: { id: existing.id },
      data: { data: params.data as object, expiresAt },
    });
  }

  return prisma.formDraft.create({
    data: {
      formId: params.formId,
      userId: params.userId ?? undefined,
      sessionId: params.sessionId ?? undefined,
      data: params.data as object,
      expiresAt,
    },
  });
}

export async function deleteFormDraft(params: {
  formId: string;
  userId?: string | null;
  sessionId?: string | null;
}) {
  const existing = await findFormDraft(params);
  if (!existing) return false;
  await prisma.formDraft.delete({ where: { id: existing.id } });
  return true;
}
