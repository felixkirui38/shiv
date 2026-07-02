"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface ApplicationDetail {
  id: string;
  applicationNumber: string;
  status: string;
  currentStep: number;
  formData: Record<string, unknown>;
  documents: {
    fieldKey: string;
    fileName: string;
    url: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  }[];
  premiumBreakdown: Record<string, unknown> | null;
  totalPremium: number;
  reviewNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  product: { slug: string; name: string; category: string | null };
  customer: { name: string; email: string; phone: string | null };
  order: { id: string; orderNumber: string; status: string; totalAmount: number } | null;
  policy: { id: string; policyNumber: string; status: string } | null;
}

const REVIEWABLE = ["SUBMITTED", "PENDING_REVIEW", "APPROVED", "DRAFT"];

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch(`/api/admin/applications/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setApp(d.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function runAction(action: "approve" | "reject" | "request_documents") {
    if (!app) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: reason || undefined, notes: notes || undefined }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage(`Application ${action.replace("_", " ")}d successfully.`);
      setNotes("");
      setReason("");
      load();
    } else {
      setMessage(data.error ?? "Action failed");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Application not found.</p>
        <Link href="/admin/applications" className="mt-4 inline-block text-primary hover:underline">
          Back to applications
        </Link>
      </div>
    );
  }

  const formEntries = Object.entries(app.formData).filter(
    ([, value]) => value !== null && value !== "" && typeof value !== "object"
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={app.applicationNumber}
        description={`${app.product.name} · ${app.customer.name}`}
        action={
          <Link href="/admin/applications">
            <Button variant="outline">Back to list</Button>
          </Link>
        }
      />

      {message && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-semibold">Application data</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {formEntries.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {key.replace(/([A-Z])/g, " $1")}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {app.documents.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-heading text-lg font-semibold">Uploaded documents</h2>
              <ul className="mt-4 space-y-2">
                {app.documents.map((doc) => (
                  <li key={doc.fieldKey} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-medium">{doc.fieldKey}</span> — {doc.fileName}
                    </span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View <ExternalLink className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-semibold">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium">{app.status.replace(/_/g, " ")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Premium</dt>
                <dd className="font-medium">KES {app.totalPremium.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Step</dt>
                <dd>{app.currentStep}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Customer</dt>
                <dd className="text-right">{app.customer.email}</dd>
              </div>
              {app.order && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Order</dt>
                  <dd>
                    <Link
                      href={`/admin/orders/${app.order.id}`}
                      className="text-primary hover:underline"
                    >
                      {app.order.orderNumber}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {REVIEWABLE.includes(app.status) && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-heading text-lg font-semibold">Review</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="review-notes">Review notes</Label>
                  <Textarea
                    id="review-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="reject-reason">Rejection reason (if rejecting)</Label>
                  <Textarea
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="accent"
                    disabled={saving}
                    onClick={() => runAction("approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => runAction("request_documents")}
                  >
                    Request documents
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={saving}
                    onClick={() => runAction("reject")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </section>
          )}

          {(app.reviewNotes || app.rejectionReason) && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
              {app.reviewNotes && <p><strong>Notes:</strong> {app.reviewNotes}</p>}
              {app.rejectionReason && (
                <p className="mt-2 text-red-700"><strong>Rejection:</strong> {app.rejectionReason}</p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
