"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [submission, setSubmission] = useState<{
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    isRead: boolean;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/contact/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSubmission(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/contact");
    else setMessage(data.error ?? "Delete failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Message not found.</p>
        <Link href="/admin/contact" className="mt-4 inline-block text-primary hover:underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title={submission.subject ?? "Contact message"}
        description={`From ${submission.name}`}
        action={<Link href="/admin/contact"><Button variant="outline">Back</Button></Link>}
      />
      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Email</dt><dd>{submission.email}</dd></div>
          <div><dt className="text-slate-500">Phone</dt><dd>{submission.phone ?? "—"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate-500">Received</dt><dd>{new Date(submission.createdAt).toLocaleString()}</dd></div>
        </dl>
        <div className="border-t border-slate-100 pt-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{submission.message}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="accent" className="gap-2">
            <a href={`mailto:${submission.email}?subject=Re: ${submission.subject ?? "Your inquiry"}`}>
              <Mail className="size-4" /> Reply by email
            </a>
          </Button>
          <Button type="button" variant="destructive" className="gap-2" onClick={handleDelete}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
