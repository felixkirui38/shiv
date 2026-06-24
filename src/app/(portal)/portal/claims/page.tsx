"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";
import { ClaimStatusBadge } from "@/components/claims/claim-status-badge";

interface ClaimItem {
  id: string;
  claimNumber: string;
  status: string;
  policyNumber: string;
  productName: string;
  claimAmount: number;
  incidentDate: string;
  createdAt: string;
  documentCount: number;
}

export default function PortalClaimsPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/claims")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setClaims(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PortalPageHeader
        title="Claims"
        description="File and track your insurance claims."
        action={
          <Link href="/portal/claims/new" className={buttonVariants({ className: "gap-2" })}>
            <Plus className="size-4" />
            Submit Claim
          </Link>
        }
      />

      {loading ? (
        <PortalLoader />
      ) : claims.length === 0 ? (
        <PortalEmptyState
          title="No claims yet"
          description="File a claim when you need to report an incident."
          action={
            <Link href="/portal/claims/new" className={buttonVariants()}>
              Submit your first claim
            </Link>
          }
        />
      ) : (
        <PortalCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Claim</th>
                <th className="px-4 py-3 text-left font-medium">Policy</th>
                <th className="px-4 py-3 text-left font-medium">Incident</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{claim.claimNumber}</td>
                  <td className="px-4 py-3">
                    <p>{claim.policyNumber}</p>
                    <p className="text-xs text-muted-foreground">{claim.productName}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(claim.incidentDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    KES {claim.claimAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <ClaimStatusBadge status={claim.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/portal/claims/${claim.id}`}
                      className="text-primary hover:underline"
                    >
                      Track
                    </Link>
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
