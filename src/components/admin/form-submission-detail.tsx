"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { isFileSubmissionValue } from "@/lib/admin/form-submission-display";

interface SubmissionField {
  key: string;
  label: string;
  section?: string;
  type: string;
  display: string;
  value: unknown;
  isFile: boolean;
}

interface SubmissionDetail {
  id: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  form: { id: string; name: string; slug: string };
  submitter: { name: string; email: string | null; phone: string | null };
  fields: SubmissionField[];
  data: Record<string, unknown>;
}

const STATUS_OPTIONS = ["submitted", "reviewed", "archived", "spam"];

export function FormSubmissionDetailClient({
  formId,
  submissionId,
}: {
  formId: string;
  submissionId: string;
}) {
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [status, setStatus] = useState("submitted");

  useEffect(() => {
    fetch(`/api/admin/forms/${formId}/submissions/${submissionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSubmission(d.data);
          setStatus(d.data.status);
        }
      })
      .finally(() => setLoading(false));
  }, [formId, submissionId]);

  async function handleStatusSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/forms/${formId}/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setSubmission(data.data);
      setMessage("Status updated.");
    } else {
      setMessage(data.error ?? "Update failed");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this submission permanently?")) return;
    const res = await fetch(`/api/admin/forms/${formId}/submissions/${submissionId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) router.push(`/admin/forms/${formId}/submissions`);
    else setMessage(data.error ?? "Delete failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Submission not found.</p>
        <Link href={`/admin/forms/${formId}/submissions`} className="mt-4 inline-block text-primary hover:underline">
          Back to submissions
        </Link>
      </div>
    );
  }

  const sections = new Map<string, SubmissionField[]>();
  for (const field of submission.fields) {
    const section = field.section ?? "Responses";
    const list = sections.get(section) ?? [];
    list.push(field);
    sections.set(section, list);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Submission detail"
        description={`${submission.form.name} · ${new Date(submission.createdAt).toLocaleString()}`}
        action={
          <Link href={`/admin/forms/${formId}/submissions`}>
            <Button variant="outline">Back to list</Button>
          </Link>
        }
      />

      {message && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {Array.from(sections.entries()).map(([section, fields]) => (
            <div key={section} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold">{section}</h2>
              <dl className="mt-4 space-y-4">
                {fields.map((field) => (
                  <div key={field.key} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{field.label}</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {field.isFile && isFileSubmissionValue(field.value) ? (
                        <a
                          href={field.value.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {field.value.fileName ?? "View file"}
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : (
                        field.display
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => setShowRaw((v) => !v)}
            >
              {showRaw ? "Hide" : "Show"} raw JSON
            </button>
            {showRaw && (
              <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-700">
                {JSON.stringify(submission.data, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-heading text-sm font-semibold text-slate-500">Submitter</h3>
            <p className="mt-2 font-medium">{submission.submitter.name}</p>
            {submission.submitter.email && (
              <p className="text-sm text-slate-600">{submission.submitter.email}</p>
            )}
            {submission.submitter.phone && (
              <p className="text-sm text-slate-600">{submission.submitter.phone}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-heading text-sm font-semibold text-slate-500">Metadata</h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">IP address</dt>
                <dd>{submission.ipAddress ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">User agent</dt>
                <dd className="break-all text-xs text-slate-600">{submission.userAgent ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-heading text-sm font-semibold text-slate-500">Status</h3>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <Button className="mt-3 w-full" size="sm" disabled={saving} onClick={handleStatusSave}>
              {saving ? "Saving…" : "Update status"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2 w-full gap-2"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" /> Delete submission
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
