"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";

const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "VOID"];

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<{
    invoiceNumber: string;
    status: string;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    dueDate: string | null;
    paidAt: string | null;
    pdfUrl: string | null;
    notes: string | null;
    createdAt: string;
    customer: { name: string; email: string; phone: string | null };
    policy: { policyNumber: string; status: string } | null;
    lineItems: { description: string; quantity: number; unitPrice: number; total: number }[];
    payments: { id: string; amount: number; status: string; provider: string }[];
  } | null>(null);
  const [status, setStatus] = useState("DRAFT");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/admin/invoices/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setInvoice(d.data);
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
    const res = await fetch(`/api/admin/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Invoice updated." : data.error ?? "Update failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Invoice not found.</p>
        <Link href="/admin/invoices" className="mt-4 inline-block text-primary hover:underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={invoice.invoiceNumber}
        description={`${invoice.customer.name} · ${invoice.customer.email}`}
        action={
          <div className="flex gap-2">
            {invoice.pdfUrl && (
              <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Download className="size-4" /> PDF
                </Button>
              </a>
            )}
            <Link href="/admin/invoices"><Button variant="outline">Back</Button></Link>
          </div>
        }
      />

      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold text-primary">
            {invoice.currency} {invoice.total.toLocaleString()}
          </p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{invoice.status}</span>
        </div>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Due date</dt><dd>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</dd></div>
          <div><dt className="text-slate-500">Paid</dt><dd>{invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "—"}</dd></div>
          {invoice.policy && (
            <div><dt className="text-slate-500">Policy</dt><dd>{invoice.policy.policyNumber}</dd></div>
          )}
        </dl>
      </div>

      {invoice.lineItems.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold">Line items</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Unit</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="py-2 text-right font-medium">{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 space-y-1 text-right text-sm text-slate-600">
            <p>Subtotal: {invoice.subtotal.toLocaleString()}</p>
            <p>Tax: {invoice.tax.toLocaleString()}</p>
          </div>
        </div>
      )}

      {invoice.payments.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold">Payments</h3>
          <ul className="space-y-2">
            {invoice.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.provider} · {invoice.currency} {p.amount.toLocaleString()}</span>
                <PaymentStatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1.5" />
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </form>
    </div>
  );
}
