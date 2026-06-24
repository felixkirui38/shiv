"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ClaimStatusBadge } from "@/components/claims/claim-status-badge";
import { ClaimTimeline } from "@/components/claims/claim-timeline";
import type { ClaimTimelineEvent } from "@/lib/claims/types";

interface Officer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface ClaimDetail {
  id: string;
  claimNumber: string;
  status: string;
  policyNumber: string;
  productName: string;
  incidentDate: string;
  description: string;
  claimAmount: number;
  approvedAmount: number | null;
  resolutionNotes: string | null;
  assignedToId: string | null;
  customer: { name: string; email: string; phone: string | null };
  assignedOfficer: { id: string; name: string; email: string } | null;
  documents: { id: string; name: string; categoryLabel: string; url: string }[];
  timeline: ClaimTimelineEvent[];
}

const STATUS_OPTIONS = [
  "UNDER_REVIEW",
  "INVESTIGATION",
  "DOCUMENTS_REQUESTED",
  "APPROVED",
  "PARTIALLY_APPROVED",
  "REJECTED",
  "PAID",
  "CLOSED",
];

export default function AdminClaimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [internalNote, setInternalNote] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [commChannel, setCommChannel] = useState("EMAIL");
  const [commSubject, setCommSubject] = useState("");
  const [commMessage, setCommMessage] = useState("");

  function load() {
    Promise.all([
      fetch(`/api/admin/claims/${id}`).then((r) => r.json()),
      fetch("/api/admin/claims?officers=1").then((r) => r.json()),
    ])
      .then(([claimRes, officersRes]) => {
        if (claimRes.success) {
          setClaim(claimRes.data);
          setNewStatus(claimRes.data.status);
        }
        if (officersRes.success) setOfficers(officersRes.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function assignOfficer(officerId: string) {
    setSaving(true);
    await fetch(`/api/admin/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignedToId: officerId === "none" ? null : officerId,
      }),
    });
    load();
    setSaving(false);
  }

  async function updateStatus() {
    setSaving(true);
    await fetch(`/api/admin/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        notes: statusNotes || undefined,
        approvedAmount: approvedAmount ? Number(approvedAmount) : undefined,
        resolutionNotes: statusNotes || undefined,
      }),
    });
    load();
    setSaving(false);
    setStatusNotes("");
  }

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    await fetch(`/api/admin/claims/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note, isInternal: internalNote }),
    });
    setNote("");
    load();
    setSaving(false);
  }

  async function sendCommunication() {
    if (!commMessage.trim()) return;
    setSaving(true);
    await fetch(`/api/admin/claims/${id}/communicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: commChannel,
        subject: commSubject || undefined,
        message: commMessage,
      }),
    });
    setCommMessage("");
    load();
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!claim) {
    return <p className="text-muted-foreground">Claim not found.</p>;
  }

  return (
    <div>
      <Link href="/admin/claims" className="text-sm text-primary hover:underline">
        ← Back to claims
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{claim.claimNumber}</h1>
          <p className="text-muted-foreground">
            {claim.customer.name} · {claim.customer.email}
          </p>
        </div>
        <ClaimStatusBadge status={claim.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold">Claim Details</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Policy</dt>
                <dd className="font-medium">
                  {claim.policyNumber} — {claim.productName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Incident</dt>
                <dd>{new Date(claim.incidentDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Claim amount</dt>
                <dd className="font-medium">
                  KES {claim.claimAmount.toLocaleString()}
                </dd>
              </div>
              {claim.approvedAmount != null && (
                <div>
                  <dt className="text-muted-foreground">Approved</dt>
                  <dd className="font-medium text-green-700">
                    KES {claim.approvedAmount.toLocaleString()}
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Description</dt>
                <dd className="mt-1">{claim.description}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold">Documents</h2>
            {claim.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents.</p>
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
                      className="text-primary hover:underline"
                    >
                      <Download className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold">Timeline</h2>
            <ClaimTimeline events={claim.timeline} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold">Assign Officer</h2>
            <Select
              value={claim.assignedToId ?? "none"}
              onValueChange={(v) => v && assignOfficer(v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select officer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {officers.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {`${o.firstName ?? ""} ${o.lastName ?? ""}`.trim() || o.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {claim.assignedOfficer && (
              <p className="mt-2 text-xs text-muted-foreground">
                Current: {claim.assignedOfficer.name}
              </p>
            )}
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold">Update Status</h2>
            <div className="space-y-3">
              <Select value={newStatus} onValueChange={(v) => v && setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {["APPROVED", "PARTIALLY_APPROVED"].includes(newStatus) && (
                <div>
                  <Label>Approved amount (KES)</Label>
                  <Input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
              <Textarea
                placeholder="Notes for status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
              <Button onClick={updateStatus} disabled={saving} className="w-full">
                Update status
              </Button>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold">Add Note</h2>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal or customer-visible note..."
              className="mb-2"
            />
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={internalNote}
                onChange={(e) => setInternalNote(e.target.checked)}
              />
              Internal only
            </label>
            <Button onClick={addNote} disabled={saving || !note.trim()} className="w-full">
              Add note
            </Button>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold">Communicate</h2>
            <div className="space-y-3">
              <Select value={commChannel} onValueChange={(v) => v && setCommChannel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="IN_APP">In-app</SelectItem>
                </SelectContent>
              </Select>
              {commChannel === "EMAIL" && (
                <Input
                  placeholder="Subject"
                  value={commSubject}
                  onChange={(e) => setCommSubject(e.target.value)}
                />
              )}
              <Textarea
                placeholder="Message to customer..."
                value={commMessage}
                onChange={(e) => setCommMessage(e.target.value)}
              />
              <Button
                onClick={sendCommunication}
                disabled={saving || !commMessage.trim()}
                className="w-full gap-2"
              >
                <Send className="size-4" />
                Send
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
