"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";

export default function AdminQuoteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [quote, setQuote] = useState<{
    quoteNumber: string;
    status: string;
    estimatedPremium: number;
    coverageAmount: number | null;
    currentStep: number;
    customerEmail: string | null;
    validUntil: string | null;
    notes: string | null;
    pdfUrl: string | null;
    createdAt: string;
    product: { name: string; slug: string };
    customer: { email: string; name: string; phone: string | null } | null;
    policy: { id: string; policyNumber: string; status: string } | null;
    payments: { id: string; amount: number; status: string; provider: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/quotes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setQuote(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Quote not found.</p>
        <Link href="/admin/quotes" className="mt-4 inline-block text-primary hover:underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={quote.quoteNumber}
        description={`${quote.product.name} · Step ${quote.currentStep}`}
        action={<Link href="/admin/quotes"><Button variant="outline">Back</Button></Link>}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold text-primary">
            KES {quote.estimatedPremium.toLocaleString()}
          </p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{quote.status}</span>
        </div>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Customer</dt><dd>{quote.customer?.name ?? quote.customerEmail ?? "—"}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd>{quote.customer?.email ?? quote.customerEmail ?? "—"}</dd></div>
          <div><dt className="text-slate-500">Coverage</dt><dd>{quote.coverageAmount ? `KES ${quote.coverageAmount.toLocaleString()}` : "—"}</dd></div>
          <div><dt className="text-slate-500">Valid until</dt><dd>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "—"}</dd></div>
          <div><dt className="text-slate-500">Created</dt><dd>{new Date(quote.createdAt).toLocaleString()}</dd></div>
        </dl>
        {quote.notes && <p className="mt-4 text-sm text-slate-600">{quote.notes}</p>}
      </div>

      {quote.policy && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-semibold">Linked policy</h3>
          <Link href={`/admin/policies/${quote.policy.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
            {quote.policy.policyNumber} <ExternalLink className="size-3.5" />
          </Link>
          <span className="ml-2 text-sm text-slate-500">{quote.policy.status}</span>
        </div>
      )}

      {quote.payments.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold">Payments</h3>
          <ul className="space-y-2">
            {quote.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.provider} · KES {p.amount.toLocaleString()}</span>
                <PaymentStatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
