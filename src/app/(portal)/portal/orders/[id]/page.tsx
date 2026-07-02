"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard } from "@/components/portal/portal-card";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderDetail {
  id: string;
  orderNumber: string;
  insuranceName: string;
  coverageSummary: string | null;
  status: string;
  subtotal: number;
  levies: number;
  taxes: number;
  stampDuty: number;
  totalAmount: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  application: {
    applicationNumber: string;
    status: string;
    resumeToken: string | null;
    productSlug: string;
    productName: string;
  };
  policy: {
    id: string;
    policyNumber: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    paidAt: string | null;
    failureReason: string | null;
  }[];
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

export default function PortalOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portal/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.data);
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

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-body">Order not found.</p>
        <Link href="/portal/orders" className={cn(buttonVariants({ variant: "link" }), "mt-4")}>
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PortalPageHeader
        title={order.orderNumber}
        description={order.insuranceName}
        action={
          <Link href="/portal/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Back
          </Link>
        }
      />

      <div className="space-y-4">
        <PortalCard className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {order.coverageSummary && (
                <p className="text-sm text-body">{order.coverageSummary}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Application {order.application.applicationNumber} ·{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl font-semibold text-primary">
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
        </PortalCard>

        <PortalCard className="p-5">
          <h3 className="mb-3 font-heading font-semibold text-dark">Price breakdown</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{order.subtotal.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Levies</dt><dd>{order.levies.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Taxes</dt><dd>{order.taxes.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Stamp duty</dt><dd>{order.stampDuty.toLocaleString()}</dd></div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <dt>Total</dt>
              <dd className="text-primary">{order.currency} {order.totalAmount.toLocaleString()}</dd>
            </div>
          </dl>
        </PortalCard>

        {order.payments.length > 0 && (
          <PortalCard className="p-5">
            <h3 className="mb-3 font-heading font-semibold text-dark">Payments</h3>
            <ul className="space-y-3">
              {order.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link href={`/portal/payments/${p.id}`} className="text-primary hover:underline">
                    {p.provider} · {p.currency} {p.amount.toLocaleString()}
                  </Link>
                  <PaymentStatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          </PortalCard>
        )}

        <div className="flex flex-wrap gap-3">
          {order.policy && (
            <Link
              href={`/portal/policies/${order.policy.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
            >
              Policy {order.policy.policyNumber}
              <ExternalLink className="size-3.5" />
            </Link>
          )}
          {order.status === "PENDING_PAYMENT" && order.application.resumeToken && (
            <Link
              href={`/products/${order.application.productSlug}/buy?resume=${order.application.resumeToken}`}
              className={buttonVariants({ size: "sm" })}
            >
              Continue checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
