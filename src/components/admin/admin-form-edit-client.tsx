"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FORM_FIELD_TYPE_OPTIONS } from "@/validations/form-admin";

interface FormField {
  id: string;
  key: string;
  label: string;
  type: string;
  placeholder?: string | null;
  helpText?: string | null;
  isRequired: boolean;
  sortOrder: number;
  options?: { value: string; label: string }[] | null;
  validation?: { section?: string } | null;
  defaultValue?: string | null;
}

interface FormDetail {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  version: number;
  fields: FormField[];
  product?: { name: string; slug: string } | null;
  counts: { submissions: number; drafts: number };
}

const OPTION_TYPES = new Set(["SELECT", "MULTI_SELECT", "RADIO"]);

function optionsToText(options?: { value: string; label: string }[] | null) {
  if (!options?.length) return "";
  return options.map((o) => `${o.value}|${o.label}`).join("\n");
}

function textToOptions(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, ...rest] = line.split("|");
      return { value: value.trim(), label: (rest.join("|") || value).trim() };
    });
}

function emptyFieldDraft(sortOrder: number) {
  return {
    key: "",
    label: "",
    type: "TEXT",
    placeholder: "",
    helpText: "",
    section: "Application",
    isRequired: false,
    sortOrder,
    optionsText: "",
    defaultValue: "",
  };
}

export function AdminFormEditClient({ formId }: { formId: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [addingField, setAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState(emptyFieldDraft(0));

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/forms/${formId}`)
      .then((r) => r.json())
      .then((formRes) => {
        if (formRes.success) {
          setForm(formRes.data);
          setName(formRes.data.name);
          setSlug(formRes.data.slug);
          setDescription(formRes.data.description ?? "");
          setIsActive(formRes.data.isActive);
        }
      })
      .finally(() => setLoading(false));
  }, [formId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveForm(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description, isActive }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage("Form saved.");
      setForm(data.data);
    } else {
      setMessage(data.error ?? "Save failed");
    }
  }

  async function handleDeleteForm() {
    if (!confirm("Delete this form and all its fields?")) return;
    const res = await fetch(`/api/admin/forms/${formId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/forms");
    else setMessage(data.error ?? "Delete failed");
  }

  function startEditField(field: FormField) {
    setEditingFieldId(field.id);
    setAddingField(false);
    setFieldDraft({
      key: field.key,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder ?? "",
      helpText: field.helpText ?? "",
      section: field.validation?.section ?? "Application",
      isRequired: field.isRequired,
      sortOrder: field.sortOrder,
      optionsText: optionsToText(field.options),
      defaultValue: field.defaultValue ?? "",
    });
  }

  function startAddField() {
    setAddingField(true);
    setEditingFieldId(null);
    setFieldDraft(emptyFieldDraft(form?.fields.length ?? 0));
  }

  async function saveField(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      key: fieldDraft.key,
      label: fieldDraft.label,
      type: fieldDraft.type,
      placeholder: fieldDraft.placeholder || undefined,
      helpText: fieldDraft.helpText || undefined,
      section: fieldDraft.section || undefined,
      isRequired: fieldDraft.isRequired,
      sortOrder: fieldDraft.sortOrder,
      defaultValue: fieldDraft.defaultValue || undefined,
      ...(OPTION_TYPES.has(fieldDraft.type)
        ? { options: textToOptions(fieldDraft.optionsText) }
        : {}),
    };

    const url = editingFieldId
      ? `/api/admin/forms/${formId}/fields/${editingFieldId}`
      : `/api/admin/forms/${formId}/fields`;
    const res = await fetch(url, {
      method: editingFieldId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!data.success) {
      setMessage(data.error ?? "Field save failed");
      return;
    }

    setAddingField(false);
    setEditingFieldId(null);
    load();
  }

  async function deleteField(fieldId: string) {
    if (!confirm("Delete this field?")) return;
    const res = await fetch(`/api/admin/forms/${formId}/fields/${fieldId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) load();
    else setMessage(data.error ?? "Delete failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Form not found.</p>
        <Link href="/admin/forms" className="mt-4 inline-block text-primary hover:underline">Back</Link>
      </div>
    );
  }

  const showFieldEditor = addingField || editingFieldId;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={form.name}
        description={`/${form.slug} · v${form.version} · ${form.counts.submissions} submissions`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="accent">
              <Link href={`/admin/forms/${formId}/submissions`}>
                Submissions ({form.counts.submissions})
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`/api/forms/${form.slug}`} target="_blank" rel="noopener noreferrer">
                Preview API
              </a>
            </Button>
            <Link href="/admin/forms"><Button variant="outline">Back</Button></Link>
          </div>
        }
      />

      {message && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>
      )}

      <form onSubmit={handleSaveForm} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Form settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1.5" />
        </div>
        {form.product && (
          <p className="text-sm text-slate-600">
            Linked product: <span className="font-medium">{form.product.name}</span> ({form.product.slug})
          </p>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (served via public forms API)
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save form"}</Button>
          <Button type="button" variant="destructive" className="gap-2" onClick={handleDeleteForm}>
            <Trash2 className="size-4" /> Delete form
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Fields ({form.fields.length})</h2>
          {!showFieldEditor && (
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={startAddField}>
              <Plus className="size-4" /> Add field
            </Button>
          )}
        </div>

        {showFieldEditor && (
          <form onSubmit={saveField} className="mb-6 space-y-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{editingFieldId ? "Edit field" : "New field"}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setAddingField(false); setEditingFieldId(null); }}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Key</Label>
                <Input
                  value={fieldDraft.key}
                  onChange={(e) => setFieldDraft({ ...fieldDraft, key: e.target.value })}
                  required
                  disabled={Boolean(editingFieldId)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Label</Label>
                <Input
                  value={fieldDraft.label}
                  onChange={(e) => setFieldDraft({ ...fieldDraft, label: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={fieldDraft.type}
                  onChange={(e) => setFieldDraft({ ...fieldDraft, type: e.target.value })}
                >
                  {FORM_FIELD_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Section</Label>
                <Input
                  value={fieldDraft.section}
                  onChange={(e) => setFieldDraft({ ...fieldDraft, section: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Placeholder</Label>
                <Input
                  value={fieldDraft.placeholder}
                  onChange={(e) => setFieldDraft({ ...fieldDraft, placeholder: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={fieldDraft.sortOrder}
                  onChange={(e) => setFieldDraft({ ...fieldDraft, sortOrder: Number(e.target.value) || 0 })}
                  className="mt-1.5"
                />
              </div>
            </div>
            {OPTION_TYPES.has(fieldDraft.type) && (
              <div>
                <Label>Options (one per line: value|Label)</Label>
                <Textarea
                  value={fieldDraft.optionsText}
                  onChange={(e) => setFieldDraft({ ...fieldDraft, optionsText: e.target.value })}
                  rows={4}
                  className="mt-1.5 font-mono text-sm"
                  placeholder={"private|Private\ncommercial|Commercial"}
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fieldDraft.isRequired}
                onChange={(e) => setFieldDraft({ ...fieldDraft, isRequired: e.target.checked })}
              />
              Required field
            </label>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingFieldId ? "Update field" : "Add field"}
            </Button>
          </form>
        )}

        {form.fields.length === 0 ? (
          <p className="text-sm text-slate-500">No fields yet. Add your first field above.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {form.fields.map((field) => (
              <div key={field.id} className="flex items-start gap-3 py-3">
                <GripVertical className="mt-1 size-4 shrink-0 text-slate-300" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{field.label}</p>
                  <p className="text-xs text-slate-500">
                    <code>{field.key}</code> · {field.type}
                    {field.validation?.section ? ` · ${field.validation.section}` : ""}
                    {field.isRequired ? " · required" : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => startEditField(field)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => deleteField(field.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
