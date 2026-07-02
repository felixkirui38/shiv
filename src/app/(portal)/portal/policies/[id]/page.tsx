"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, ExternalLink, Loader2, RefreshCw, Shield } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard } from "@/components/portal/portal-card";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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
  createdAt: string;
  product: {
    name: string;
    slug: string;
    icon: string | null;
    category: string | null;
    shortDescription: string | null;
  };
  application: { applicationNumber: string; status: string } | null;
  order: {
    orderNumber: string;
    status: string;
    totalAmount: number;
    paidAt: string | null;
  } | null;
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    mimeType: string;
    createdAt: string;
  }[];
  recentClaims: {
    id: string;
    claimNumber: string;
    status: string;
    createdAt: string;
  }[];
  renewals: {
    id: string;
    premium: number;
    renewedAt: string;
    newEnd: string;
  }[];
  counts: { claims: number; payments: number };
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  RENEWED: "bg-blue-100 text-blue-800",
  EXPIRED: "bg-red-100 text-red-800",
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-slate-100 text-slate-500",
  LAPSED: "bg-orange-100 text-orange-800",
};

export default function PolicyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portal/policies/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPolicy(d.data);
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

  if (!policy) {
    return (
      <div className="py-16 text-center">
        <p className="text-body">Policy not found.</p>
        <Link href="/portal/policies" className="mt-4 inline-block text-primary hover:underline">
          Back to policies
        </Link>
      </div>
    );
  }

  const Icon = getIcon(policy.product.icon ?? "shield");

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={policy.product.name}
        description={policy.policyNumber}
        action={
          <Link href="/portal/policies" className={buttonVariants({ variant: "outline" })}>
            Back to policies
          </Link>
        }
      />

      <PortalCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Icon className="size-8" />
            </div>
            <div>
              <span
                className={cn(
                  "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                  STATUS_STYLES[policy.status] ?? "bg-slate-100 text-slate-600"
                )}
              >
                {policy.status.replace(/_/g, " ")}
              </span>
              {policy.product.shortDescription && (
                <p className="mt-2 max-w-xl text-sm text-body">{policy.product.shortDescription}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.open(`/api/portal/policies/${policy.id}/certificate`, "_blank")}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              <Download className="size-3.5" />
              Certificate
            </button>
            {["ACTIVE", "EXPIRED"].includes(policy.status) && (
              <Link
                href="/portal/renewals"
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
              >
                <RefreshCw className="size-3.5" />
                Renew
              </Link>
            )}
            <Link
              href="/portal/claims/new"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              File a claim
            </Link>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-body">Annual premium</dt>
            <dd className="mt-1 font-heading text-lg font-semibold text-primary">
              KES {policy.premium.toLocaleString()}
            </dd>
          </div>
          {policy.coverageAmount && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-body">Coverage</dt>
              <dd className="mt-1 font-medium">KES {policy.coverageAmount.toLocaleString()}</dd>
            </div>
          )}
          {policy.deductible && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-body">Deductible</dt>
              <dd className="mt-1 font-medium">KES {policy.deductible.toLocaleString()}</dd>
            </div>
          )}
          {policy.startDate && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-body">Start date</dt>
              <dd className="mt-1 font-medium">{new Date(policy.startDate).toLocaleDateString()}</dd>
            </div>
          )}
          {policy.endDate && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-body">End date</dt>
              <dd className="mt-1 font-medium">{new Date(policy.endDate).toLocaleDateString()}</dd>
            </div>
          )}
          {policy.renewalDate && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-body">Renewal date</dt>
              <dd className="mt-1 font-medium">{new Date(policy.renewalDate).toLocaleDateString()}</dd>
            </div>
          )}
        </dl>

        {policy.autoRenew && (
          <p className="mt-4 text-sm text-body">
            <Shield className="mr-1 inline size-4" />
            Auto-renewal is enabled for this policy.
          </p>
        )}
      </PortalCard>

      {(policy.application || policy.order) && (
        <PortalCard>
          <h2 className="font-heading text-lg font-semibold text-dark">Purchase details</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {policy.application && (
              <div>
                <dt className="text-body">Application</dt>
                <dd className="font-medium">{policy.application.applicationNumber}</dd>
              </div>
            )}
            {policy.order && (
              <>
                <div>
                  <dt className="text-body">Order</dt>
                  <dd className="font-medium">{policy.order.orderNumber}</dd>
                </div>
                <div>
                  <dt className="text-body">Order total</dt>
                  <dd className="font-medium">KES {policy.order.totalAmount.toLocaleString()}</dd>
                </div>
              </>
            )}
          </dl>
        </PortalCard>
      )}

      {policy.documents.length > 0 && (
        <PortalCard>
          <h2 className="font-heading text-lg font-semibold text-dark">Policy documents</h2>
          <ul className="mt-4 space-y-2">
            {policy.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between text-sm">
                <span>{doc.name}</span>
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
        </PortalCard>
      )}

      {policy.recentClaims.length > 0 && (
        <PortalCard>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-dark">Recent claims</h2>
            <Link href="/portal/claims" className="text-sm text-primary hover:underline">
              View all ({policy.counts.claims})
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {policy.recentClaims.map((claim) => (
              <li key={claim.id}>
                <Link href={`/portal/claims/${claim.id}`} className="text-primary hover:underline">
                  {claim.claimNumber}
                </Link>
                <span className="ml-2 text-body">— {claim.status.replace(/_/g, " ")}</span>
              </li>
            ))}
          </ul>
        </PortalCard>
      )}
    </div>
  );
}
