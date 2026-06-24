"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PortalLoader } from "@/components/portal/portal-card";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms/homepage")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSettings(d.data); });
  }, []);

  return (
    <div>
      <AdminPageHeader title="Settings" description="Site configuration, integrations, and environment." />
      {settings ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 font-semibold">Environment Variables</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Stripe", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "Configured" : "Set in .env"],
                ["Resend Email", "Set in .env"],
                ["Cloudinary", "Set in .env"],
                ["Database", "PostgreSQL via Prisma"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-100 py-2">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 font-semibold">Roles & Permissions</h2>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {["Super Admin", "Admin", "Finance", "Claims Officer", "Marketing", "Agent", "Manager"].map((r) => (
                <li key={r} className="rounded-lg bg-slate-50 px-3 py-2">{r}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Permissions are defined in <code>src/lib/permissions.ts</code> and enforced on every admin API route.
            </p>
          </div>
        </div>
      ) : (
        <PortalLoader />
      )}
    </div>
  );
}
