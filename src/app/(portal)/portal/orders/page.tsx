"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";

interface OrderItem {
  id: string;
  orderNumber: string;
  insuranceName: string;
  coverageSummary: string | null;
  status: string;
  totalAmount: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  application: {
    id: string;
    applicationNumber: string;
    status: string;
    resumeToken: string | null;
    productSlug: string;
  };
  policy: { id: string; policyNumber: string; status: string } | null;
  latestPayment: {
    id: string;
    status: string;
    amount: number;
    provider: string;
  } | null;
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-800",
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  POLICY_GENERATED: "bg-primary/10 text-primary",
  EXPIRED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/portal/orders${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data.items);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <PortalPageHeader
        title="My Orders"
        description="Track insurance purchase orders from application through payment."
        action={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-brand-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING_PAYMENT">Pending payment</option>
            <option value="PAID">Paid</option>
            <option value="POLICY_GENERATED">Policy issued</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      />

      {loading ? (
        <PortalLoader />
      ) : orders.length === 0 ? (
        <PortalEmptyState
          title="No orders yet"
          description="Start an insurance application from our products page to create your first order."
          action={
            <Link href="/products" className="text-primary hover:underline">
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              role="link"
              tabIndex={0}
              className="cursor-pointer"
              onClick={() => router.push(`/portal/orders/${order.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") router.push(`/portal/orders/${order.id}`);
              }}
            >
            <PortalCard className="p-5 transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {order.orderNumber}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-semibold text-dark">
                    {order.insuranceName}
                  </h3>
                  {order.coverageSummary && (
                    <p className="mt-1 text-sm text-body">{order.coverageSummary}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Application {order.application.applicationNumber} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-xl font-semibold text-primary">
                    {order.currency} {order.totalAmount.toLocaleString()}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ORDER_STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-brand-border/60 pt-4 text-sm">
                {order.latestPayment && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Payment:</span>
                    <PaymentStatusBadge status={order.latestPayment.status} />
                  </div>
                )}
                {order.policy && (
                  <Link
                    href="/portal/policies"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Policy {order.policy.policyNumber}
                    <ExternalLink className="size-3.5" />
                  </Link>
                )}
                {order.status === "PENDING_PAYMENT" && order.application.resumeToken && (
                  <Link
                    href={`/products/${order.application.productSlug}/buy?resume=${order.application.resumeToken}`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Continue checkout
                  </Link>
                )}
              </div>
            </PortalCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
