"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ClaimStatusBadge } from "@/components/claims/claim-status-badge";

interface ClaimItem {
  id: string;
  claimNumber: string;
  status: string;
  policyNumber: string;
  productName: string;
  customer?: string;
  claimAmount: number;
  incidentDate: string;
  assignedOfficer: string | null;
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/claims${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setClaims(d.data.items);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Claims Management</h1>
        <p className="text-muted-foreground">
          Review, assign officers, and process insurance claims.
        </p>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="mb-4 rounded-md border px-3 py-2 text-sm"
      >
        <option value="">All statuses</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="UNDER_REVIEW">Review</option>
        <option value="INVESTIGATION">Investigation</option>
        <option value="DOCUMENTS_REQUESTED">Documents Requested</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="PAID">Paid</option>
      </select>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : claims.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No claims found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Claim</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Policy</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Officer</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{claim.claimNumber}</td>
                  <td className="px-4 py-3">{claim.customer ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p>{claim.policyNumber}</p>
                    <p className="text-xs text-muted-foreground">{claim.productName}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    KES {claim.claimAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {claim.assignedOfficer ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3">
                    <ClaimStatusBadge status={claim.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/claims/${claim.id}`}
                      className="text-primary hover:underline"
                    >
                      Manage
                    </Link>
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
