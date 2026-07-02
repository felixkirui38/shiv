"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, Loader2, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const STATUSES = ["pending", "reviewing", "shortlisted", "rejected", "hired"];

export default function AdminCareerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [application, setApplication] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    position: string;
    status: string;
    coverLetter: string | null;
    createdAt: string;
    resume: { url: string; fileName: string } | null;
  } | null>(null);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    fetch(`/api/admin/careers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setApplication(d.data);
          setStatus(d.data.status);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/careers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Application updated." : data.error ?? "Update failed");
  }

  async function handleDelete() {
    if (!confirm("Delete this application?")) return;
    const res = await fetch(`/api/admin/careers/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/careers");
    else setMessage(data.error ?? "Delete failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Application not found.</p>
        <Link href="/admin/careers" className="mt-4 inline-block text-primary hover:underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title={`${application.firstName} ${application.lastName}`}
        description={application.position}
        action={<Link href="/admin/careers"><Button variant="outline">Back</Button></Link>}
      />
      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Email</dt><dd>{application.email}</dd></div>
          <div><dt className="text-slate-500">Phone</dt><dd>{application.phone ?? "—"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate-500">Applied</dt><dd>{new Date(application.createdAt).toLocaleString()}</dd></div>
        </dl>
        {application.coverLetter && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500">Cover letter</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{application.coverLetter}</p>
          </div>
        )}
        {application.resume && (
          <div className="mt-4">
            <a
              href={application.resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-4" />
              {application.resume.fileName}
            </a>
          </div>
        )}
        <Button asChild variant="outline" className="mt-4 gap-2">
          <a href={`mailto:${application.email}?subject=Re: ${application.position} application`}>
            <Mail className="size-4" /> Email applicant
          </a>
        </Button>
      </div>
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save status"}</Button>
          <Button type="button" variant="destructive" className="gap-2" onClick={handleDelete}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </form>
    </div>
  );
}
