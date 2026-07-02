"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { STAFF_ROLE_OPTIONS, STAFF_STATUS_OPTIONS } from "@/validations/admin-user";

interface StaffUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  status: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [status, setStatus] = useState("ACTIVE");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUser(d.data);
          setFirstName(d.data.firstName ?? "");
          setLastName(d.data.lastName ?? "");
          setPhone(d.data.phone ?? "");
          setRole(d.data.role);
          setStatus(d.data.status);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone: phone || undefined,
        role,
        status,
        password: password || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage("User updated.");
      setPassword("");
      setUser(data.data);
    } else {
      setMessage(data.error ?? "Update failed");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this staff user permanently?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/admin/users");
    else setMessage(data.error ?? "Delete failed");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p>User not found.</p>
        <Link href="/admin/users" className="mt-4 inline-block text-primary hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title={user.email}
        description="Edit staff account details and access level."
        action={
          <Link href="/admin/users">
            <Button variant="outline">Back to list</Button>
          </Link>
        }
      />

      {message && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{message}</div>
      )}

      <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="edit-first">First name</Label>
            <Input id="edit-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="edit-last">Last name</Label>
            <Input id="edit-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user.email} disabled className="mt-1.5 bg-slate-50" />
        </div>
        <div>
          <Label htmlFor="edit-phone">Phone</Label>
          <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="edit-role">Role</Label>
            <select id="edit-role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {STAFF_ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="edit-status">Status</Label>
            <select id="edit-status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {STAFF_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="edit-password">New password (optional)</Label>
          <Input id="edit-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} className="mt-1.5" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
          </Button>
          <Button type="button" variant="destructive" className="gap-2" onClick={handleDelete}>
            <Trash2 className="size-4" />
            Delete user
          </Button>
        </div>
      </form>
    </div>
  );
}
