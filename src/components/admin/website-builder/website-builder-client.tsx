"use client";

import { useCallback, useEffect, useState } from "react";
import {
  History,
  Loader2,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PortalLoader } from "@/components/portal/portal-card";
import { Button } from "@/components/ui/button";
import { SectionOrderList } from "@/components/admin/website-builder/section-order-list";
import { SectionEditors } from "@/components/admin/website-builder/section-editors";
import { WebsitePreview } from "@/components/admin/website-builder/website-preview";
import { LAYOUT_PANELS } from "@/config/website-builder.defaults";
import type { HomepageContent } from "@/types/homepage";
import type { SiteNavigationConfig } from "@/types/navigation";
import type {
  WebsiteBuilderState,
  WebsiteEditorPanel,
  WebsiteSectionId,
  WebsiteVersionSummary,
} from "@/types/website-builder";

export function WebsiteBuilderClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activePanel, setActivePanel] = useState<WebsiteEditorPanel>("hero");
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<WebsiteVersionSummary[]>([]);

  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [navigation, setNavigation] = useState<SiteNavigationConfig | null>(null);
  const [sectionOrder, setSectionOrder] = useState<WebsiteSectionId[]>([]);
  const [sectionVisibility, setSectionVisibility] = useState<
    Record<WebsiteSectionId, boolean>
  >({} as Record<WebsiteSectionId, boolean>);
  const [meta, setMeta] = useState<Pick<WebsiteBuilderState, "hasUnpublishedChanges" | "publishedVersionId">>({
    hasUnpublishedChanges: false,
    publishedVersionId: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/cms/website-builder");
    const data = await res.json();
    if (data.success) {
      const state = data.data as WebsiteBuilderState;
      setHomepage(state.homepage);
      setNavigation(state.navigation);
      setSectionOrder(state.sectionOrder);
      setSectionVisibility(state.sectionVisibility);
      setMeta({
        hasUnpublishedChanges: state.hasUnpublishedChanges,
        publishedVersionId: state.publishedVersionId,
      });
    }
    setLoading(false);
  }, []);

  const loadVersions = useCallback(async () => {
    const res = await fetch("/api/admin/cms/website-builder?versions=1");
    const data = await res.json();
    if (data.success) setVersions(data.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveDraft() {
    if (!homepage || !navigation) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/cms/website-builder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homepage,
        navigation,
        sectionOrder,
        sectionVisibility,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage("Draft saved.");
      setMeta({ hasUnpublishedChanges: true, publishedVersionId: data.data.publishedVersionId });
    } else {
      setMessage(data.error ?? "Save failed");
    }
  }

  async function publish() {
    if (!homepage || !navigation) return;
    if (!confirm("Publish this draft to the live website?")) return;
    setSaving(true);
    setMessage("");

    const saveRes = await fetch("/api/admin/cms/website-builder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homepage,
        navigation,
        sectionOrder,
        sectionVisibility,
      }),
    });
    if (!saveRes.ok) {
      setSaving(false);
      setMessage("Failed to save draft before publish");
      return;
    }

    const res = await fetch("/api/admin/cms/website-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage("Published to live site.");
      setMeta({ hasUnpublishedChanges: false, publishedVersionId: data.data.versionId });
      loadVersions();
    } else {
      setMessage(data.error ?? "Publish failed");
    }
  }

  async function rollback(versionId: string, publish: boolean) {
    const action = publish
      ? "Restore and publish this version immediately?"
      : "Load this version as a new draft?";
    if (!confirm(action)) return;
    setSaving(true);
    const res = await fetch("/api/admin/cms/website-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rollback", versionId, publish }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage(publish ? "Version restored and published." : "Version loaded as draft.");
      await load();
      loadVersions();
      setShowVersions(false);
    } else {
      setMessage(data.error ?? "Rollback failed");
    }
  }

  function toggleVisibility(id: WebsiteSectionId) {
    setSectionVisibility((v) => ({ ...v, [id]: !v[id] }));
  }

  if (loading || !homepage || !navigation) return <PortalLoader />;

  return (
    <div>
      <AdminPageHeader
        title="Website Builder"
        description="Edit homepage sections, header, and footer — drag to reorder, preview live, publish when ready."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowVersions(!showVersions);
                if (!showVersions) loadVersions();
              }}
              className="gap-2"
            >
              <History className="size-4" /> Versions
            </Button>
            <Button variant="outline" onClick={saveDraft} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save draft
            </Button>
            <Button onClick={publish} disabled={saving} className="gap-2">
              <Upload className="size-4" /> Publish
            </Button>
          </div>
        }
      />

      {meta.hasUnpublishedChanges && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          You have unpublished draft changes. Save and publish to update the live site.
        </p>
      )}

      {message && (
        <p className="mb-4 text-sm text-slate-600">{message}</p>
      )}

      {showVersions && (
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left">
              <tr>
                <th className="p-3">Version</th>
                <th className="p-3">Status</th>
                <th className="p-3">Label</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="p-3">v{v.versionNumber}</td>
                  <td className="p-3">{v.status}</td>
                  <td className="p-3">{v.label ?? "—"}</td>
                  <td className="p-3">
                    {new Date(v.publishedAt ?? v.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rollback(v.id, false)}
                      >
                        <RotateCcw className="mr-1 size-3" /> Draft
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => rollback(v.id, true)}
                      >
                        Publish
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[240px_1fr_1fr]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Layout
            </p>
            <div className="space-y-1">
              {LAYOUT_PANELS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePanel(p.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    activePanel === p.id
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Homepage sections
            </p>
            <SectionOrderList
              order={sectionOrder}
              visibility={sectionVisibility}
              activeId={activePanel}
              onSelect={(id) => setActivePanel(id as WebsiteEditorPanel)}
              onReorder={setSectionOrder}
              onToggleVisibility={toggleVisibility}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-semibold capitalize">
            {activePanel.replace(/([A-Z])/g, " $1")}
          </h3>
          <SectionEditors
            panel={activePanel}
            homepage={homepage}
            navigation={navigation}
            onHomepageChange={setHomepage}
            onNavigationChange={setNavigation}
          />
        </div>

        <WebsitePreview
          homepage={homepage}
          navigation={navigation}
          sectionOrder={sectionOrder}
          sectionVisibility={sectionVisibility}
        />
      </div>
    </div>
  );
}
