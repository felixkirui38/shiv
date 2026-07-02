"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STAFF_ROLE_OPTIONS, STAFF_STATUS_OPTIONS } from "@/validations/admin-user";

interface CreateStaffUserPanelProps {
  onCreated?: () => void;
}

export function CreateStaffUserPanel({ onCreated }: CreateStaffUserPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [status, setStatus] = useState("ACTIVE");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        role,
        status,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Failed to create user");
      return;
    }

    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setOpen(false);
    onCreated?.();
  }

  if (!open) {
    return (
      <Button type="button" variant="accent" className="gap-2" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" />
        Add staff user
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="font-heading text-lg font-semibold">New staff user</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="staff-first">First name</Label>
          <Input id="staff-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="staff-last">Last name</Label>
          <Input id="staff-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="staff-email">Email</Label>
          <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="staff-phone">Phone</Label>
          <Input id="staff-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="staff-password">Temporary password</Label>
          <Input id="staff-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="staff-role">Role</Label>
          <select id="staff-role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {STAFF_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="staff-status">Status</Label>
          <select id="staff-status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {STAFF_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Create user"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
