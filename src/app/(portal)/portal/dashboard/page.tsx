"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CreditCard,
  Download,
  FileText,
  RefreshCw,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalStatCard } from "@/components/portal/portal-stat-card";
import { PortalActionCard } from "@/components/portal/portal-action-card";
import { PortalCard, PortalLoader } from "@/components/portal/portal-card";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardData {
  user: { name: string; email?: string };
  stats: {
    activePolicies: number;
    openClaims: number;
    premiumDue: number;
    pendingPaymentCount: number;
    renewalsDue: number;
  };
  unreadNotifications: number;
  recentPayments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    paidAt: string | null;
    createdAt: string;
    policyNumber?: string;
  }[];
  upcomingRenewals: {
    id: string;
    policyNumber: string;
    productName: string;
    premium: number;
    renewalDate: string | null;
  }[];
}

export default function PortalDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PortalLoader />;
  if (!data) return <p className="text-body">Unable to load dashboard.</p>;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PortalPageHeader
        title={`${greeting}, ${data.user.name}`}
        description="Here's an overview of your insurance portfolio."
        action={
          data.unreadNotifications > 0 ? (
            <Link
              href="/portal/notifications"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {data.unreadNotifications} new notification
              {data.unreadNotifications > 1 ? "s" : ""}
            </Link>
          ) : undefined
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard
          label="Active Policies"
          value={data.stats.activePolicies}
          icon={Shield}
          accent="primary"
          delay={0}
        />
        <PortalStatCard
          label="Open Claims"
          value={data.stats.openClaims}
          icon={AlertCircle}
          accent="secondary"
          delay={0.05}
        />
        <PortalStatCard
          label="Premium Due"
          value={
            data.stats.premiumDue > 0
              ? `KES ${data.stats.premiumDue.toLocaleString()}`
              : "—"
          }
          icon={Wallet}
          trend={
            data.stats.pendingPaymentCount > 0
              ? `${data.stats.pendingPaymentCount} pending payment(s)`
              : "All caught up"
          }
          accent="accent"
          delay={0.1}
        />
        <PortalStatCard
          label="Renewals Due"
          value={data.stats.renewalsDue}
          icon={RefreshCw}
          trend="Within 30 days"
          accent="primary"
          delay={0.15}
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 font-heading text-lg font-semibold text-dark">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PortalActionCard
            title="Renew Policy"
            description="Keep your coverage active"
            href="/portal/renewals"
            icon={RefreshCw}
            variant="accent"
            delay={0.1}
          />
          <PortalActionCard
            title="Pay Premium"
            description="Settle outstanding premiums"
            href="/portal/payments"
            icon={CreditCard}
            delay={0.15}
          />
          <PortalActionCard
            title="Submit Claim"
            description="File a new insurance claim"
            href="/portal/claims/new"
            icon={FileText}
            delay={0.2}
          />
          <PortalActionCard
            title="Download Certificate"
            description="Get your policy certificates"
            href="/portal/policies"
            icon={Download}
            delay={0.25}
          />
          <PortalActionCard
            title="Update Profile"
            description="Manage your personal details"
            href="/portal/profile"
            icon={User}
            delay={0.3}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard delay={0.2}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-dark">Recent Payments</h2>
            <Link href="/portal/payments" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {data.recentPayments.length === 0 ? (
            <p className="text-sm text-body">No payments yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentPayments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-brand-border/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-dark">
                      {p.description ?? "Premium payment"}
                    </p>
                    <p className="text-xs text-body">
                      {p.policyNumber && `Policy ${p.policyNumber} · `}
                      {new Date(p.paidAt ?? p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {p.currency} {p.amount.toLocaleString()}
                    </p>
                    <PaymentStatusBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard delay={0.25}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-dark">Upcoming Renewals</h2>
            <Link href="/portal/renewals" className="text-sm text-primary hover:underline">
              Manage
            </Link>
          </div>
          {data.upcomingRenewals.length === 0 ? (
            <p className="text-sm text-body">No renewals due in the next 30 days.</p>
          ) : (
            <ul className="space-y-3">
              {data.upcomingRenewals.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-brand-border/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-dark">{r.productName}</p>
                    <p className="text-xs text-body">Policy {r.policyNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      KES {r.premium.toLocaleString()}
                    </p>
                    <p className="text-xs text-body">
                      {r.renewalDate
                        ? new Date(r.renewalDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>
      </div>
    </div>
  );
}
