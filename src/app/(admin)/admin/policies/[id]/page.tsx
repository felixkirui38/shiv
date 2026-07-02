"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const POLICY_STATUSES = [
  "DRAFT",
  "PENDING_PAYMENT",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "LAPSED",
  "RENEWED",
];

interface PolicyDetail {
  id: string;
  policyNumber: string;
  status: string;
  premium: number;
  coverageAmount: number | null;
  deductible: number | null;
  startDate: string | null;
  endDate: string | null;
  renewalDate: string | null;
  autoRenew: boolean;
  customer: { name: string; email: string; phone: string | null };
  product: { name: string; slug: string };
  application: { id: string; applicationNumber: string; status: string } | null;
  order: { orderNumber: string; status: string } | null;
  documents: { name: string; url: string; fileName: string }[];
  counts: { claims: number; payments: number; renewals: number };
}

export default function AdminPolicyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [coverageAmount, setCoverageAmount] = useState("");
  const [deductible, setDeductible] = useState("");

  useEffect(() => {
    fetch(`/api/admin/policies/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPolicy(d.data);
          setStatus(d.data.status);
          setStartDate(d.data.startDate ?? "");
          setEndDate(d.data.endDate ?? "");
          setRenewalDate(d.data.renewalDate ?? "");
          setAutoRenew(d.data.autoRenew);
          setCoverageAmount(d.data.coverageAmount != null ? String(d.data.coverageAmount) : "");
          setDeductible(d.data.deductible != null ? String(d.data.deductible) : "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/policies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        startDate: startDate || null,
        endDate: endDate || null,
        renewalDate: renewalDate || null,
        autoRenew,
        coverageAmount: coverageAmount ? Number(coverageAmount) : null,
        deductible: deductible ? Number(deductible) : null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage("Policy updated.");
      setPolicy((prev) => (prev ? { ...prev, status: data.data.status } : prev));
    } else {
      setMessage(data.error ?? "Update failed");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Policy not found.</p>
        <Link href="/admin/policies" className="mt-4 inline-block text-primary hover:underline">
          Back to policies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={policy.policyNumber}
        description={`${policy.product.name} · ${policy.customer.name}`}
        action={
          <Link href="/admin/policies">
            <Button variant="outline">Back to list</Button>
          </Link>
        }
      />

      {message && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold">Policy details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {POLICY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Premium (KES)</Label>
                <Input value={policy.premium.toLocaleString()} disabled className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="coverage">Coverage amount</Label>
                <Input
                  id="coverage"
                  type="number"
                  value={coverageAmount}
                  onChange={(e) => setCoverageAmount(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="deductible">Deductible</Label>
                <Input
                  id="deductible"
                  type="number"
                  value={deductible}
                  onChange={(e) => setDeductible(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="renewalDate">Renewal date</Label>
                <Input id="renewalDate" type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />
              Auto-renew enabled
            </label>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </form>

          {policy.documents.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold">Documents</h2>
              <ul className="mt-4 space-y-2">
                {policy.documents.map((doc) => (
                  <li key={doc.name}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {doc.fileName || doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-heading text-sm font-semibold text-slate-500">Customer</h3>
            <p className="mt-2 font-medium">{policy.customer.name}</p>
            <p className="text-sm text-slate-600">{policy.customer.email}</p>
            {policy.customer.phone && <p className="text-sm text-slate-600">{policy.customer.phone}</p>}
          </div>
          {policy.application && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-heading text-sm font-semibold text-slate-500">Application</h3>
              <p className="mt-2 font-medium">{policy.application.applicationNumber}</p>
              <p className="text-sm text-slate-600">{policy.application.status}</p>
              <Link href={`/admin/applications/${policy.application.id}`} className="mt-2 inline-block text-sm text-primary hover:underline">
                View application
              </Link>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-heading text-sm font-semibold text-slate-500">Activity</h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Claims</dt><dd>{policy.counts.claims}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Payments</dt><dd>{policy.counts.payments}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Renewals</dt><dd>{policy.counts.renewals}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
