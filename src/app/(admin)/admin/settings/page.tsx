"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSiteSettingsForm } from "@/components/admin/admin-site-settings-form";
import { PortalLoader } from "@/components/portal/portal-card";
import type { HomepageContent } from "@/types/homepage";
import type { SiteNavigationConfig } from "@/types/navigation";

export default function AdminSettingsPage() {
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [navigation, setNavigation] = useState<SiteNavigationConfig | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/cms/homepage").then((r) => r.json()),
      fetch("/api/admin/cms/navigation").then((r) => r.json()),
    ]).then(([homepageRes, navigationRes]) => {
      if (homepageRes.success) setHomepage(homepageRes.data);
      if (navigationRes.success) setNavigation(navigationRes.data);
    });
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Homepage hero, navigation bar, and site-wide content defaults."
      />
      {homepage && navigation ? (
        <AdminSiteSettingsForm initialHomepage={homepage} initialNavigation={navigation} />
      ) : (
        <PortalLoader />
      )}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Integrations</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Stripe", "Set STRIPE_SECRET_KEY in .env"],
            ["M-Pesa webhooks", "Set MPESA_WEBHOOK_SECRET in production"],
            ["Pesapal webhooks", "Set PESAPAL_WEBHOOK_SECRET in production"],
            ["Resend Email", "Set RESEND_API_KEY in .env"],
            ["Cloudinary", "Set CLOUDINARY_* in .env"],
            ["Database", "PostgreSQL via prisma dev"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-slate-100 py-2">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
