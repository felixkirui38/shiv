"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Upload, FileText } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/claims/types";

interface PolicyOption {
  id: string;
  policyNumber: string;
  productName: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  category: string;
  url: string;
}

const UPLOAD_CATEGORIES = [
  "POLICE_ABSTRACT",
  "PHOTO",
  "VIDEO",
  "MEDICAL_REPORT",
] as const;

export default function NewClaimPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<PolicyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);

  const [policyId, setPolicyId] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [description, setDescription] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<(typeof UPLOAD_CATEGORIES)[number]>("PHOTO");

  useEffect(() => {
    fetch("/api/claims?policies=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPolicies(d.data);
          if (d.data[0]) setPolicyId(d.data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function createDraft() {
    setError(null);
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        policyId,
        incidentDate,
        description,
        claimAmount: Number(claimAmount),
      }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.error ?? "Failed to create claim");
      return null;
    }
    setClaimId(data.data.id);
    return data.data.id as string;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      let id = claimId;
      if (!id) {
        id = await createDraft();
        if (!id) return;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", uploadCategory);

      const res = await fetch(`/api/claims/${id}/documents`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => [...prev, data.data.document]);
      } else {
        setError(data.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      let id = claimId;
      if (!id) {
        id = await createDraft();
        if (!id) return;
      }

      const res = await fetch(`/api/claims/${id}/submit`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        router.push(`/portal/claims/${id}`);
      } else {
        setError(data.error ?? "Submit failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/portal/claims" className="text-sm text-primary hover:underline">
          ← Back to claims
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Submit a Claim</h1>
        <p className="text-muted-foreground">
          Provide incident details and upload supporting documents.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {policies.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No active policies found. You need an active policy to file a claim.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 space-y-4">
            <div>
              <Label>Policy Number</Label>
              <Select value={policyId} onValueChange={(v) => v && setPolicyId(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  {policies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.policyNumber} — {p.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="incidentDate">Incident Date</Label>
              <Input
                id="incidentDate"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 min-h-28"
                placeholder="Describe what happened, including location, parties involved, and damages..."
                required
              />
            </div>

            <div>
              <Label htmlFor="claimAmount">Claim Amount (KES)</Label>
              <Input
                id="claimAmount"
                type="number"
                min={1}
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold">Supporting Documents</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload police abstract, photos, videos, and medical reports (PDF, images, MP4 — max 25MB).
            </p>

            <div className="mb-4 max-w-xs">
              <Label>Document type</Label>
              <Select
                value={uploadCategory}
                onValueChange={(v) =>
                  v && setUploadCategory(v as (typeof UPLOAD_CATEGORIES)[number])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UPLOAD_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {DOCUMENT_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:bg-slate-50">
              <Upload className="mb-2 size-8 text-primary" />
              <span className="text-sm font-medium">
                {uploading ? "Uploading..." : "Click to upload"}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov,.webm"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>

            {documents.length > 0 && (
              <ul className="mt-4 space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between rounded border p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <span>{doc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {DOCUMENT_CATEGORY_LABELS[doc.category as keyof typeof DOCUMENT_CATEGORY_LABELS]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || !policyId || !incidentDate || !description || !claimAmount}
          >
            {submitting ? "Submitting..." : "Submit Claim"}
          </Button>
        </div>
      )}
    </div>
  );
}
