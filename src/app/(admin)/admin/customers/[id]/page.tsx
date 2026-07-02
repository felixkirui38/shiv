"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"];

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [customer, setCustomer] = useState<{
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    status: string;
    createdAt: string;
    lastLoginAt: string | null;
    counts: { policies: number; claims: number; orders: number; payments: number };
    recentPolicies: { id: string; policyNumber: string; status: string }[];
    recentOrders: { id: string; orderNumber: string; status: string; totalAmount: number }[];
  } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCustomer(d.data);
          setFirstName(d.data.firstName ?? "");
          setLastName(d.data.lastName ?? "");
          setPhone(d.data.phone ?? "");
          setStatus(d.data.status);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, phone, status }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Customer updated." : data.error ?? "Update failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Customer not found.</p>
        <Link href="/admin/customers" className="mt-4 inline-block text-primary hover:underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={`${firstName} ${lastName}`.trim() || customer.email}
        description={customer.email}
        action={<Link href="/admin/customers"><Button variant="outline">Back</Button></Link>}
      />

      {message && <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Policies", value: customer.counts.policies },
          { label: "Claims", value: customer.counts.claims },
          { label: "Orders", value: customer.counts.orders },
          { label: "Payments", value: customer.counts.payments },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-semibold text-primary">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500">
          Joined {new Date(customer.createdAt).toLocaleDateString()}
          {customer.lastLoginAt && ` · Last login ${new Date(customer.lastLoginAt).toLocaleDateString()}`}
        </p>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </form>

      {customer.recentPolicies.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold">Recent policies</h3>
          <ul className="space-y-2 text-sm">
            {customer.recentPolicies.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/policies/${p.id}`} className="text-primary hover:underline">
                  {p.policyNumber}
                </Link>
                <span className="ml-2 text-slate-500">{p.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {customer.recentOrders.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold">Recent orders</h3>
          <ul className="space-y-2 text-sm">
            {customer.recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="text-primary hover:underline">
                  {o.orderNumber}
                </Link>
                <span className="ml-2 text-slate-500">{o.status} · KES {o.totalAmount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
