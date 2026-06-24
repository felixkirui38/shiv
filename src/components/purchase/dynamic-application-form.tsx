"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CmsFormDefinition, CmsFormField } from "@/types/purchase";

interface DynamicApplicationFormProps {
  form: CmsFormDefinition;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
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

export function DynamicApplicationForm({
  form,
  values,
  onChange,
  errors = {},
}: DynamicApplicationFormProps) {
  const sections = useMemo(() => groupFields(form.fields), [form.fields]);

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
                onChange={(v) => onChange(field.key, v)}
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
  onChange,
}: {
  field: CmsFormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
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
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange({ fileName: file.name, size: file.size, type: file.type });
          }}
        />
        {typeof value === "object" && value && "fileName" in (value as object) && (
          <p className="mt-1 text-xs text-body">
            Selected: {(value as { fileName: string }).fileName}
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
    if (value === undefined || value === null || value === "") {
      errors[field.key] = `${field.label} is required`;
    }
  }
  return errors;
}
