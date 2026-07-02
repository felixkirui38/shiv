import { defaultPurchaseFormsBySlug } from "@/config/purchase-forms.defaults";
import type { CmsFormDefinition } from "@/types/purchase";

function stubId(prefix: string, key: string) {
  return `fallback-${prefix}-${key}`;
}

export function getFallbackPurchaseFormBySlug(slug: string): CmsFormDefinition | null {
  const config = defaultPurchaseFormsBySlug[slug];
  if (!config) return null;

  const formSlug = `${slug}-application`;
  const sections = [...new Set(config.fields.map((f) => f.section))];

  return {
    id: stubId("form", slug),
    slug: formSlug,
    name: config.name,
    description: null,
    settings: {
      sections: sections.map((title, i) => ({ id: `s${i}`, title })),
    },
    fields: config.fields.map((f, i) => ({
      id: stubId("field", `${slug}-${f.key}`),
      key: f.key,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder ?? null,
      helpText: null,
      isRequired: f.isRequired ?? false,
      sortOrder: i,
      options: f.options ?? null,
      validation: { section: f.section },
      defaultValue: null,
    })),
  };
}
