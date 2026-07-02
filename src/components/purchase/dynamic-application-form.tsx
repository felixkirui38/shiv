"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CmsFormDefinition, CmsFormField } from "@/types/purchase";
import type { ApplicationUploadedFile } from "@/lib/purchase/documents";

interface DynamicApplicationFormProps {
  form: CmsFormDefinition;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
  applicationId?: string;
  resumeToken?: string;
  onUploadError?: (message: string) => void;
}

function groupFields(fields: CmsFormField[]) {
  const groups = new Map<string, CmsFormField[]>();
  for (const field of fields) {
    const section = field.validation?.section ?? "Application";
    const list = groups.get(section) ?? [];
    list.push(field);
    groups.set(section, list);
  }
  return [...groups.entries()];
}

function parseOptions(options: unknown): { value: string; label: string }[] {
  if (!Array.isArray(options)) return [];
  return options as { value: string; label: string }[];
}

function isUploadedFile(value: unknown): value is ApplicationUploadedFile {
  return Boolean(value && typeof value === "object" && "url" in (value as object));
}

export function DynamicApplicationForm({
  form,
  values,
  onChange,
  errors = {},
  applicationId,
  resumeToken,
  onUploadError,
}: DynamicApplicationFormProps) {
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const sections = useMemo(() => groupFields(form.fields), [form.fields]);

  async function uploadFile(fieldKey: string, file: File) {
    if (!applicationId) {
      onUploadError?.("Unable to upload files right now. Please refresh and try again.");
      return;
    }

    setUploadingField(fieldKey);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("fieldKey", fieldKey);

      const headers: Record<string, string> = {};
      if (resumeToken) headers["x-resume-token"] = resumeToken;

      const res = await fetch(`/api/purchase/applications/${applicationId}/documents`, {
        method: "POST",
        headers,
        body,
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { file: ApplicationUploadedFile };
      };

      if (!res.ok || !data.success || !data.data?.file) {
        onUploadError?.(data.error ?? "Upload failed. Please try again.");
        return;
      }

      onChange(fieldKey, data.data.file);
    } catch {
      onUploadError?.("Upload failed. Please try again.");
    } finally {
      setUploadingField(null);
    }
  }

  return (
    <div className="space-y-8">
      {sections.map(([section, fields]) => (
        <div key={section}>
          <h3 className="mb-4 font-heading text-lg font-semibold text-primary">{section}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <FieldControl
                key={field.id}
                field={field}
                value={values[field.key]}
                error={errors[field.key]}
                uploading={uploadingField === field.key}
                onChange={(v) => onChange(field.key, v)}
                onFileSelect={(file) => uploadFile(field.key, file)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldControl({
  field,
  value,
  error,
  uploading,
  onChange,
  onFileSelect,
}: {
  field: CmsFormField;
  value: unknown;
  error?: string;
  uploading?: boolean;
  onChange: (value: unknown) => void;
  onFileSelect?: (file: File) => void;
}) {
  const id = `field-${field.key}`;
  const className = field.type === "TEXTAREA" ? "md:col-span-2" : "";

  if (field.type === "BOOLEAN" || field.type === "CHECKBOX") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          id={id}
          type="checkbox"
          className="size-4 rounded border border-input"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <Label htmlFor={id} className="text-sm text-body">
          {field.label}
        </Label>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  if (field.type === "SELECT" || field.type === "RADIO") {
    const options = parseOptions(field.options);
    return (
      <div className={className}>
        <Label htmlFor={id}>
          {field.label}
          {field.isRequired ? " *" : ""}
        </Label>
        <select
          id={id}
          className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {field.helpText && <p className="mt-1 text-xs text-muted-foreground">{field.helpText}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  if (field.type === "TEXTAREA") {
    return (
      <div className={className}>
        <Label htmlFor={id}>
          {field.label}
          {field.isRequired ? " *" : ""}
        </Label>
        <Textarea
          id={id}
          className="mt-1.5"
          placeholder={field.placeholder ?? undefined}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  if (field.type === "FILE") {
    const uploaded = isUploadedFile(value) ? value : null;
    return (
      <div className={className}>
        <Label htmlFor={id}>
          {field.label}
          {field.isRequired ? " *" : ""}
        </Label>
        <Input
          id={id}
          type="file"
          className="mt-1.5"
          accept=".pdf,.png,.jpg,.jpeg"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect?.(file);
          }}
        />
        {uploading && <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>}
        {uploaded && (
          <p className="mt-1 text-xs text-body">
            Uploaded:{" "}
            <a
              href={uploaded.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {uploaded.fileName}
            </a>
          </p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  const inputType =
    field.type === "EMAIL"
      ? "email"
      : field.type === "PHONE"
        ? "tel"
        : field.type === "NUMBER" || field.type === "CURRENCY"
          ? "number"
          : field.type === "DATE"
            ? "date"
            : "text";

  return (
    <div className={className}>
      <Label htmlFor={id}>
        {field.label}
        {field.isRequired ? " *" : ""}
      </Label>
      <Input
        id={id}
        type={inputType}
        className="mt-1.5"
        placeholder={field.placeholder ?? undefined}
        value={String(value ?? "")}
        onChange={(e) =>
          onChange(inputType === "number" ? Number(e.target.value) : e.target.value)
        }
      />
      {field.helpText && <p className="mt-1 text-xs text-muted-foreground">{field.helpText}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function validateDynamicForm(
  form: CmsFormDefinition,
  values: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of form.fields) {
    if (!field.isRequired) continue;
    const value = values[field.key];

    if (field.type === "FILE") {
      if (!isUploadedFile(value) || !value.url) {
        errors[field.key] = `${field.label} is required`;
      }
      continue;
    }

    if (value === undefined || value === null || value === "") {
      errors[field.key] = `${field.label} is required`;
    }
  }
  return errors;
}
