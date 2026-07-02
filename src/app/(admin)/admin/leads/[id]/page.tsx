"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

export default function AdminLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lead, setLead] = useState<{
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    status: string;
    source: string | null;
    productType: string | null;
    notes: string | null;
    createdAt: string;
  } | null>(null);
  const [status, setStatus] = useState("NEW");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/admin/leads/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLead(d.data);
          setStatus(d.data.status);
          setNotes(d.data.notes ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Lead updated." : data.error ?? "Update failed");
  }

  async function handleDelete() {
    if (!confirm("Delete this lead?")) return;
    const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/leads");
    else setMessage(data.error ?? "Delete failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Lead not found.</p>
        <Link href="/admin/leads" className="mt-4 inline-block text-primary hover:underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title={`${lead.firstName} ${lead.lastName ?? ""}`.trim()}
        description={lead.email}
        action={<Link href="/admin/leads"><Button variant="outline">Back</Button></Link>}
      />
      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Phone</dt><dd>{lead.phone ?? "—"}</dd></div>
          <div><dt className="text-slate-500">Product</dt><dd>{lead.productType ?? "—"}</dd></div>
          <div><dt className="text-slate-500">Source</dt><dd>{lead.source ?? "—"}</dd></div>
          <div><dt className="text-slate-500">Created</dt><dd>{new Date(lead.createdAt).toLocaleString()}</dd></div>
        </dl>
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
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} className="mt-1.5" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          <Button type="button" variant="destructive" className="gap-2" onClick={handleDelete}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </form>
    </div>
  );
}
