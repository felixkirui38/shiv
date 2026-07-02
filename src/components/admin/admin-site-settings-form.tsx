"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HomepageContent } from "@/types/homepage";
import type { SiteNavigationConfig } from "@/types/navigation";

interface AdminSiteSettingsFormProps {
  initialHomepage: HomepageContent;
  initialNavigation: SiteNavigationConfig;
}

export function AdminSiteSettingsForm({
  initialHomepage,
  initialNavigation,
}: AdminSiteSettingsFormProps) {
  const [homepage, setHomepage] = useState(initialHomepage);
  const [navigation, setNavigation] = useState(initialNavigation);
  const [savingHomepage, setSavingHomepage] = useState(false);
  const [savingNavigation, setSavingNavigation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setHomepage(initialHomepage);
    setNavigation(initialNavigation);
  }, [initialHomepage, initialNavigation]);

  async function saveHomepage(e: React.FormEvent) {
    e.preventDefault();
    setSavingHomepage(true);
    setMessage(null);
    const res = await fetch("/api/admin/cms/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(homepage),
    });
    const data = await res.json();
    setSavingHomepage(false);
    setMessage(data.success ? "Homepage settings saved." : data.error ?? "Save failed");
  }

  async function saveNavigation(e: React.FormEvent) {
    e.preventDefault();
    setSavingNavigation(true);
    setMessage(null);
    const res = await fetch("/api/admin/cms/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(navigation),
    });
    const data = await res.json();
    setSavingNavigation(false);
    setMessage(data.success ? "Navigation settings saved." : data.error ?? "Save failed");
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <form onSubmit={saveHomepage} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Homepage hero</h2>
        <p className="mt-1 text-sm text-slate-500">Main headline and call-to-action on the homepage.</p>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="hero-headline">Headline</Label>
            <Input
              id="hero-headline"
              value={homepage.hero.headline}
              onChange={(e) =>
                setHomepage((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, headline: e.target.value },
                }))
              }
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="hero-sub">Subheadline</Label>
            <Textarea
              id="hero-sub"
              value={homepage.hero.subheadline}
              onChange={(e) =>
                setHomepage((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, subheadline: e.target.value },
                }))
              }
              rows={3}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="hero-bg">Background image URL</Label>
            <Input
              id="hero-bg"
              value={homepage.hero.backgroundImageUrl ?? ""}
              onChange={(e) =>
                setHomepage((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, backgroundImageUrl: e.target.value },
                }))
              }
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="hero-primary-label">Primary button label</Label>
              <Input
                id="hero-primary-label"
                value={homepage.hero.primaryButtonLabel}
                onChange={(e) =>
                  setHomepage((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, primaryButtonLabel: e.target.value },
                  }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hero-primary-href">Primary button link</Label>
              <Input
                id="hero-primary-href"
                value={homepage.hero.primaryButtonHref}
                onChange={(e) =>
                  setHomepage((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, primaryButtonHref: e.target.value },
                  }))
                }
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
        <Button type="submit" className="mt-6 gap-2" disabled={savingHomepage}>
          {savingHomepage ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save homepage
        </Button>
      </form>

      <form onSubmit={saveNavigation} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Site navigation</h2>
        <p className="mt-1 text-sm text-slate-500">Notification bar and emergency contact details.</p>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="notif-message">Notification bar message</Label>
            <Input
              id="notif-message"
              value={navigation.notification.message}
              onChange={(e) =>
                setNavigation((prev) => ({
                  ...prev,
                  notification: { ...prev.notification, message: e.target.value },
                }))
              }
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="notif-phone">Notification phone</Label>
              <Input
                id="notif-phone"
                value={navigation.notification.phone ?? ""}
                onChange={(e) =>
                  setNavigation((prev) => ({
                    ...prev,
                    notification: { ...prev.notification, phone: e.target.value },
                  }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="emergency-label">Emergency button label</Label>
              <Input
                id="emergency-label"
                value={navigation.actions.emergencyLabel}
                onChange={(e) =>
                  setNavigation((prev) => ({
                    ...prev,
                    actions: { ...prev.actions, emergencyLabel: e.target.value },
                  }))
                }
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="footer-desc">Footer company description</Label>
            <Textarea
              id="footer-desc"
              value={navigation.footer.companyDescription}
              onChange={(e) =>
                setNavigation((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, companyDescription: e.target.value },
                }))
              }
              rows={3}
              className="mt-1.5"
            />
          </div>
        </div>
        <Button type="submit" className="mt-6 gap-2" disabled={savingNavigation}>
          {savingNavigation ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save navigation
        </Button>
      </form>
    </div>
  );
}
