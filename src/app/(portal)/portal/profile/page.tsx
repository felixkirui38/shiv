"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, User } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard } from "@/components/portal/portal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileData {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  address: {
    street?: string;
    city?: string;
    county?: string;
    postalCode?: string;
  };
  memberSince: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProfile(d.data);
          setFirstName(d.data.firstName ?? "");
          setLastName(d.data.lastName ?? "");
          setPhone(d.data.phone ?? "");
          setDateOfBirth(d.data.dateOfBirth ?? "");
          setStreet(d.data.address?.street ?? "");
          setCity(d.data.address?.city ?? "");
          setCounty(d.data.address?.county ?? "");
          setPostalCode(d.data.address?.postalCode ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/portal/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth || undefined,
        address: { street, city, county, postalCode },
      }),
    });
    const data = await res.json();
    if (data.success) {
      setSaved(true);
      setProfile(data.data);
    } else {
      setError(data.error ?? "Save failed");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PortalPageHeader
        title="Profile"
        description="Update your personal information and contact details."
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <PortalCard>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
              <User className="size-8" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-dark">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-body">{profile?.email}</p>
              {profile?.memberSince && (
                <p className="text-xs text-body">
                  Member since {new Date(profile.memberSince).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {saved && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Profile updated successfully.
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} disabled className="mt-1 bg-brand-light" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                  placeholder="+254..."
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="border-t border-brand-border/50 pt-5">
              <p className="mb-3 font-medium text-dark">Address</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="postal">Postal code</Label>
                  <Input
                    id="postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full gap-2 sm:w-auto">
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save changes
            </Button>
          </form>
        </PortalCard>
      </motion.div>
    </div>
  );
}
