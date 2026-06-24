"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";

interface PaymentItem {
  id: string;
  type: string;
  planType: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
  receiptUrl: string | null;
  receiptNumber: string | null;
  policyNumber?: string;
  quoteNumber?: string;
  invoiceNumber?: string;
  failureReason?: string | null;
  installmentNumber?: number | null;
  installmentTotal?: number | null;
}

const PROVIDER_LABELS: Record<string, string> = {
  STRIPE: "Stripe",
  PESAPAL: "Pesapal",
  FLUTTERWAVE: "Flutterwave",
  MPESA: "M-Pesa",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/payments${qs}`);
      const data = await res.json();
      if (data.success) setPayments(data.data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  return (
    <div>
      <PortalPageHeader
        title="Payment History"
        description="View all premium payments, installments, and renewals."
        action={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-brand-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUCCEEDED">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        }
      />

      {loading ? (
        <PortalLoader />
      ) : payments.length === 0 ? (
        <PortalEmptyState
          title="No payments yet"
          description="Complete a quote or renew a policy to see payment history here."
        />
      ) : (
        <PortalCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-left font-medium">Provider</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.paidAt ?? p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.description ?? p.type}</p>
                    {p.installmentNumber && p.installmentTotal && (
                      <p className="text-xs text-muted-foreground">
                        Installment {p.installmentNumber}/{p.installmentTotal}
                      </p>
                    )}
                    {p.policyNumber && (
                      <p className="text-xs text-muted-foreground">
                        Policy {p.policyNumber}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">{PROVIDER_LABELS[p.provider] ?? p.provider}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {p.currency} {p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={p.status} />
                    {p.failureReason && (
                      <p className="mt-1 text-xs text-red-600">{p.failureReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.receiptUrl ? (
                      <a
                        href={p.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Download className="size-3.5" />
                        {p.receiptNumber ?? "PDF"}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </PortalCard>
      )}
    </div>
  );
}
