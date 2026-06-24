"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PortalLoader } from "@/components/portal/portal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { STATIC_SEO_PAGES } from "@/config/seo.defaults";
import type { SeoCmsData } from "@/types/seo";

type Tab = "global" | "pages" | "organization" | "technical";

export default function AdminSeoPage() {
  const [data, setData] = useState<SeoCmsData | null>(null);
  const [tab, setTab] = useState<Tab>("global");
  const [selectedPage, setSelectedPage] = useState("/");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); });
  }, []);

  function updateGlobal<K extends keyof SeoCmsData["global"]>(key: K, value: SeoCmsData["global"][K]) {
    setData((d) => d ? { ...d, global: { ...d.global, [key]: value } } : d);
  }

  function updatePage(path: string, field: string, value: unknown) {
    setData((d) => {
      if (!d) return d;
      return {
        ...d,
        pages: {
          ...d.pages,
          [path]: { ...d.pages[path], [field]: value },
        },
      };
    });
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSaving(false);
    setMessage(result.success ? "SEO settings saved." : result.error ?? "Save failed");
  }

  if (!data) return <PortalLoader />;

  const pageOverride = data.pages[selectedPage] ?? {};
  const tabs: { id: Tab; label: string }[] = [
    { id: "global", label: "Global" },
    { id: "pages", label: "Pages" },
    { id: "organization", label: "Organization" },
    { id: "technical", label: "Sitemap & Robots" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="SEO"
        description="Meta tags, Open Graph, Twitter Cards, JSON-LD, sitemap, and robots — CMS editable with automatic generation on blog and products."
        action={
          <div className="flex gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              Sitemap <ExternalLink className="size-3" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              Robots <ExternalLink className="size-3" />
            </a>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t.id ? "border-b-2 border-primary text-primary" : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.includes("saved") ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {tab === "global" && (
        <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <Label>Site name</Label>
            <Input value={data.global.siteName} onChange={(e) => updateGlobal("siteName", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Site URL (canonical base)</Label>
            <Input value={data.global.siteUrl} onChange={(e) => updateGlobal("siteUrl", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Title template (%s = page title)</Label>
            <Input value={data.global.titleTemplate} onChange={(e) => updateGlobal("titleTemplate", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Default meta title</Label>
            <Input value={data.global.defaultTitle} onChange={(e) => updateGlobal("defaultTitle", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Default meta description</Label>
            <Textarea value={data.global.defaultDescription} onChange={(e) => updateGlobal("defaultDescription", e.target.value)} rows={3} className="mt-1" />
          </div>
          <div>
            <Label>Default keywords (comma-separated)</Label>
            <Input
              value={data.global.defaultKeywords.join(", ")}
              onChange={(e) => updateGlobal("defaultKeywords", e.target.value.split(",").map((k) => k.trim()).filter(Boolean))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Default OG image URL</Label>
            <Input value={data.global.defaultOgImage} onChange={(e) => updateGlobal("defaultOgImage", e.target.value)} className="mt-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Twitter handle</Label>
              <Input value={data.global.twitterHandle ?? ""} onChange={(e) => updateGlobal("twitterHandle", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Twitter card</Label>
              <select
                value={data.global.twitterCard}
                onChange={(e) => updateGlobal("twitterCard", e.target.value as "summary" | "summary_large_image")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="summary_large_image">Summary large image</option>
                <option value="summary">Summary</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {tab === "pages" && (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-2">
            {STATIC_SEO_PAGES.map((p) => (
              <button
                key={p.path}
                type="button"
                onClick={() => setSelectedPage(p.path)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selectedPage === p.path ? "bg-primary/10 font-medium text-primary" : "hover:bg-slate-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold">Override: {selectedPage}</h3>
            <p className="text-xs text-slate-500">Blog and product pages auto-generate SEO from their content. Override static pages here.</p>
            {(["title", "description", "ogTitle", "ogDescription", "canonical", "ogImage"] as const).map((field) => (
              <div key={field}>
                <Label>{field}</Label>
                {field === "description" || field === "ogDescription" ? (
                  <Textarea
                    value={(pageOverride[field] as string) ?? ""}
                    onChange={(e) => updatePage(selectedPage, field, e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                ) : (
                  <Input
                    value={(pageOverride[field] as string) ?? ""}
                    onChange={(e) => updatePage(selectedPage, field, e.target.value)}
                    className="mt-1"
                  />
                )}
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pageOverride.noIndex ?? false}
                onChange={(e) => updatePage(selectedPage, "noIndex", e.target.checked)}
              />
              No index (hide from search engines)
            </label>
          </div>
        </div>
      )}

      {tab === "organization" && (
        <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Used in Organization, InsuranceAgency, and Article publisher JSON-LD.</p>
          {(["name", "legalName", "url", "logo", "telephone", "email"] as const).map((field) => (
            <div key={field}>
              <Label>{field}</Label>
              <Input
                value={data.global.organization[field] ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    global: {
                      ...data.global,
                      organization: { ...data.global.organization, [field]: e.target.value },
                    },
                  })
                }
                className="mt-1"
              />
            </div>
          ))}
          <div>
            <Label>Social profiles (one URL per line)</Label>
            <Textarea
              value={(data.global.organization.sameAs ?? []).join("\n")}
              onChange={(e) =>
                setData({
                  ...data,
                  global: {
                    ...data.global,
                    organization: {
                      ...data.global.organization,
                      sameAs: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    },
                  },
                })
              }
              rows={4}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {tab === "technical" && (
        <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.global.sitemap.enabled}
              onChange={(e) =>
                setData({
                  ...data,
                  global: { ...data.global, sitemap: { ...data.global.sitemap, enabled: e.target.checked } },
                })
              }
            />
            Enable XML sitemap
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.global.sitemap.includeBlog}
              onChange={(e) =>
                setData({
                  ...data,
                  global: { ...data.global, sitemap: { ...data.global.sitemap, includeBlog: e.target.checked } },
                })
              }
            />
            Include blog posts in sitemap
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.global.sitemap.includeProducts}
              onChange={(e) =>
                setData({
                  ...data,
                  global: { ...data.global, sitemap: { ...data.global.sitemap, includeProducts: e.target.checked } },
                })
              }
            />
            Include insurance products in sitemap
          </label>
          <div>
            <Label>Excluded paths (one per line)</Label>
            <Textarea
              value={data.global.sitemap.excludePaths.join("\n")}
              onChange={(e) =>
                setData({
                  ...data,
                  global: {
                    ...data.global,
                    sitemap: {
                      ...data.global.sitemap,
                      excludePaths: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    },
                  },
                })
              }
              rows={4}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div className="border-t border-slate-100 pt-4">
            <h3 className="mb-3 font-medium">Robots defaults</h3>
            <label className="mb-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={data.global.robots.index}
                onChange={(e) =>
                  setData({
                    ...data,
                    global: { ...data.global, robots: { ...data.global.robots, index: e.target.checked } },
                  })
                }
              />
              Allow indexing
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={data.global.robots.follow}
                onChange={(e) =>
                  setData({
                    ...data,
                    global: { ...data.global, robots: { ...data.global.robots, follow: e.target.checked } },
                  })
                }
              />
              Allow following links
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
