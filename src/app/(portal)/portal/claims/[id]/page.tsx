"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaimStatusBadge } from "@/components/claims/claim-status-badge";
import { ClaimTimeline } from "@/components/claims/claim-timeline";
import type { ClaimTimelineEvent } from "@/lib/claims/types";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/claims/types";

interface ClaimDetail {
  id: string;
  claimNumber: string;
  status: string;
  policyNumber: string;
  productName: string;
  incidentDate: string;
  reportedDate: string;
  description: string;
  claimAmount: number;
  approvedAmount: number | null;
  resolutionNotes: string | null;
  documents: {
    id: string;
    name: string;
    category: string;
    categoryLabel: string;
    url: string;
    mimeType: string;
  }[];
  timeline: ClaimTimelineEvent[];
}

export default function ClaimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  function load() {
    fetch(`/api/claims/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setClaim(d.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", "OTHER");
    await fetch(`/api/claims/${id}/documents`, { method: "POST", body: fd });
    load();
    setUploading(false);
    e.target.value = "";
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Claim not found.</p>
        <Link href="/portal/claims" className="mt-4 inline-block text-primary hover:underline">
          Back to claims
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/portal/claims" className="text-sm text-primary hover:underline">
        ← Back to claims
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{claim.claimNumber}</h1>
          <p className="text-muted-foreground">
            {claim.productName} · Policy {claim.policyNumber}
          </p>
        </div>
        <ClaimStatusBadge status={claim.status} />
      </div>

      <dl className="mt-6 grid gap-4 rounded-lg border bg-white p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Incident date</dt>
          <dd className="font-medium">
            {new Date(claim.incidentDate).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Reported</dt>
          <dd className="font-medium">
            {new Date(claim.reportedDate).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Claim amount</dt>
          <dd className="font-medium">KES {claim.claimAmount.toLocaleString()}</dd>
        </div>
        {claim.approvedAmount != null && (
          <div>
            <dt className="text-sm text-muted-foreground">Approved amount</dt>
            <dd className="font-medium text-green-700">
              KES {claim.approvedAmount.toLocaleString()}
            </dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-sm text-muted-foreground">Description</dt>
          <dd className="mt-1">{claim.description}</dd>
        </div>
        {claim.resolutionNotes && (
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted-foreground">Resolution</dt>
            <dd className="mt-1">{claim.resolutionNotes}</dd>
          </div>
        )}
      </dl>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Documents</h2>
          {claim.status === "DOCUMENTS_REQUESTED" && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
              <Upload className="size-4" />
              {uploading ? "Uploading..." : "Upload"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov,.webm"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
        {claim.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2">
            {claim.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.categoryLabel}</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Download className="size-4" />
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Claim Timeline</h2>
        <ClaimTimeline events={claim.timeline} />
      </section>
    </div>
  );
}
