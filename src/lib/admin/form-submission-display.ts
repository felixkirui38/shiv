export interface FormFieldMeta {
  key: string;
  label: string;
  type: string;
  section?: string;
}

export function formatSubmissionValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map((v) => formatSubmissionValue(v)).join(", ");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.fileName === "string") return obj.fileName;
    if (typeof obj.url === "string") return obj.url;
    return JSON.stringify(obj);
  }
  return String(value);
}

export function isFileSubmissionValue(
  value: unknown
): value is { url: string; fileName?: string } {
  return Boolean(value && typeof value === "object" && "url" in (value as object));
}

export function buildSubmissionFieldRows(
  data: Record<string, unknown>,
  fields: FormFieldMeta[]
) {
  const used = new Set<string>();

  const rows = fields.map((field) => {
    used.add(field.key);
    return {
      key: field.key,
      label: field.label,
      section: field.section,
      type: field.type,
      value: data[field.key],
      display: formatSubmissionValue(data[field.key]),
      isFile: isFileSubmissionValue(data[field.key]),
    };
  });

  for (const [key, value] of Object.entries(data)) {
    if (used.has(key)) continue;
    rows.push({
      key,
      label: key,
      section: undefined,
      type: "unknown",
      value,
      display: formatSubmissionValue(value),
      isFile: isFileSubmissionValue(value),
    });
  }

  return rows;
}

export function previewFromSubmissionData(data: Record<string, unknown>): string {
  const preferred = ["email", "fullName", "name", "phone", "firstName"];
  for (const key of preferred) {
    const val = data[key];
    if (typeof val === "string" && val.trim()) return val;
  }
  const first = Object.values(data).find((v) => typeof v === "string" && v.trim());
  return typeof first === "string" ? first : "—";
}
