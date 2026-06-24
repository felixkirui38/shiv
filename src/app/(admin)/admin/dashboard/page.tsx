"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  FileText,
  Package,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ClaimStatusBadge } from "@/components/claims/claim-status-badge";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { PortalLoader } from "@/components/portal/portal-card";

interface DashboardData {
  stats: {
    revenue: number;
    premiumCollected: number;
    claimsPaid: number;
    pendingClaims: number;
    customers: number;
    renewalsDue: number;
    products: number;
  };
  recentLeads: { id: string; name: string; email: string; status: string; createdAt: string }[];
  recentClaims: { id: string; claimNumber: string; status: string; amount: number; createdAt: string }[];
  recentPayments: { id: string; amount: number; currency: string; status: string; customer: string; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PortalLoader />;
  if (!data) return <p className="text-slate-500">Unable to load dashboard.</p>;

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  return (
    <div>
      <AdminPageHeader
        title="Enterprise Dashboard"
        description="Real-time insurance operations overview — all data from your database."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Revenue" value={fmt(data.stats.revenue)} icon={TrendingUp} delay={0} />
        <AdminStatCard label="Premium Collected" value={fmt(data.stats.premiumCollected)} icon={Banknote} delay={0.05} accent="from-emerald-500/20 to-emerald-500/5" />
        <AdminStatCard label="Claims Paid" value={fmt(data.stats.claimsPaid)} icon={FileText} delay={0.1} accent="from-amber-500/20 to-amber-500/5" />
        <AdminStatCard label="Pending Claims" value={data.stats.pendingClaims} icon={AlertCircle} delay={0.15} accent="from-red-500/20 to-red-500/5" />
        <AdminStatCard label="Customers" value={data.stats.customers} icon={Users} delay={0.2} />
        <AdminStatCard label="Renewals Due" value={data.stats.renewalsDue} icon={RefreshCw} delay={0.25} />
        <AdminStatCard label="Active Products" value={data.stats.products} icon={Package} delay={0.3} />
        <AdminStatCard label="Policies" value="—" icon={Shield} trend="View in Policies module" delay={0.35} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {data.recentLeads.map((l) => (
              <li key={l.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-xs text-slate-500">{l.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{l.status}</span>
              </li>
            ))}
            {data.recentLeads.length === 0 && <p className="text-sm text-slate-500">No leads yet.</p>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Claims</h2>
            <Link href="/admin/claims" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {data.recentClaims.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/claims/${c.id}`} className="font-medium hover:text-primary">{c.claimNumber}</Link>
                <div className="text-right">
                  <p className="text-xs font-medium">{fmt(c.amount)}</p>
                  <ClaimStatusBadge status={c.status} />
                </div>
              </li>
            ))}
            {data.recentClaims.length === 0 && <p className="text-sm text-slate-500">No claims yet.</p>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Payments</h2>
            <Link href="/admin/payments" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {data.recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{p.currency} {p.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{p.customer}</p>
                </div>
                <PaymentStatusBadge status={p.status} />
              </li>
            ))}
            {data.recentPayments.length === 0 && <p className="text-sm text-slate-500">No payments yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
