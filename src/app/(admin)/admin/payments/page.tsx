"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";

interface PaymentItem {
  id: string;
  type: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
  customer: string;
  policyNumber?: string;
  quoteNumber?: string;
}

interface ReportData {
  totalRevenue: number;
  successfulCount: number;
  byStatus: { status: string; count: number; amount: number }[];
  byProvider: { provider: string; count: number; amount: number }[];
}

const PROVIDER_LABELS: Record<string, string> = {
  STRIPE: "Stripe",
  PESAPAL: "Pesapal",
  FLUTTERWAVE: "Flutterwave",
  MPESA: "M-Pesa",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [reports, setReports] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [refunding, setRefunding] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (providerFilter) params.set("provider", providerFilter);

      const [payRes, repRes] = await Promise.all([
        fetch(`/api/admin/payments?${params}`),
        fetch("/api/admin/payments/reports"),
      ]);
      const payData = await payRes.json();
      const repData = await repRes.json();
      if (payData.success) setPayments(payData.data.items);
      if (repData.success) setReports(repData.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter, providerFilter]);

  async function handleRefund(paymentId: string) {
    const reason = prompt("Refund reason (optional):");
    if (reason === null) return;
    setRefunding(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) load();
      else alert(data.error ?? "Refund failed");
    } finally {
      setRefunding(null);
    }
  }

  function exportCsv() {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (providerFilter) params.set("provider", providerFilter);
    window.open(`/api/admin/payments/export?${params}`, "_blank");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Track payments, process refunds, and export reports.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={load} className="gap-2">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportCsv} className="gap-2">
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {reports && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Total revenue</p>
            <p className="text-2xl font-bold">
              KES {reports.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Successful payments</p>
            <p className="text-2xl font-bold">{reports.successfulCount}</p>
          </div>
          {reports.byProvider.map((p) => (
            <div key={p.provider} className="rounded-lg border bg-white p-4">
              <p className="text-sm text-muted-foreground">
                {PROVIDER_LABELS[p.provider] ?? p.provider}
              </p>
              <p className="text-2xl font-bold">KES {p.amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{p.count} payments</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCEEDED">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All providers</option>
          {Object.entries(PROVIDER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Provider</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.paidAt ?? p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.customer}</p>
                    {p.policyNumber && (
                      <p className="text-xs text-muted-foreground">
                        {p.policyNumber}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">{PROVIDER_LABELS[p.provider] ?? p.provider}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {p.currency} {p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "SUCCEEDED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={refunding === p.id}
                        onClick={() => handleRefund(p.id)}
                      >
                        {refunding === p.id ? "..." : "Refund"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
