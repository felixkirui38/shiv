"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Play, Save } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PortalLoader } from "@/components/portal/portal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_EVENT_LABELS,
} from "@/config/notification.defaults";

interface Template {
  id: string;
  event: string;
  channel: string;
  name: string;
  subject: string | null;
  body: string;
  isActive: boolean;
}

type Tab = "templates" | "queue" | "logs";

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<Tab>("templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [queue, setQueue] = useState<Record<string, unknown>[]>([]);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadTemplates = useCallback(async () => {
    const res = await fetch("/api/admin/notifications/templates");
    const data = await res.json();
    if (data.success) {
      setTemplates(data.data);
      if (!selected && data.data.length) setSelected(data.data[0]);
    }
  }, [selected]);

  const loadQueue = useCallback(async () => {
    const res = await fetch("/api/admin/notifications/queue");
    const data = await res.json();
    if (data.success) setQueue(data.data.items ?? []);
  }, []);

  const loadLogs = useCallback(async () => {
    const res = await fetch("/api/admin/notifications/logs");
    const data = await res.json();
    if (data.success) setLogs(data.data.items ?? []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTemplates(), loadQueue(), loadLogs()]).finally(() => setLoading(false));
  }, [loadTemplates, loadQueue, loadLogs]);

  async function saveTemplate() {
    if (!selected) return;
    setSaving(true);
    const res = await fetch("/api/admin/notifications/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id,
        subject: selected.subject,
        body: selected.body,
        isActive: selected.isActive,
      }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Template saved." : data.error ?? "Save failed");
    if (data.success) loadTemplates();
  }

  async function processQueue() {
    setSaving(true);
    const res = await fetch("/api/admin/notifications/queue", { method: "POST" });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? `Processed ${data.data.processed} job(s).` : "Process failed");
    loadQueue();
    loadLogs();
  }

  if (loading) return <PortalLoader />;

  const tabs: { id: Tab; label: string }[] = [
    { id: "templates", label: "Templates" },
    { id: "queue", label: "Queue" },
    { id: "logs", label: "Logs" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Notifications"
        description="Email, SMS, WhatsApp, and in-app notifications — editable templates, queue, and delivery logs."
        action={
          tab === "queue" ? (
            <Button onClick={processQueue} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              Process queue
            </Button>
          ) : tab === "templates" && selected ? (
            <Button onClick={saveTemplate} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save template
            </Button>
          ) : undefined
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
        <p className={`mb-4 text-sm ${message.includes("saved") || message.includes("Processed") ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {tab === "templates" && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="max-h-[600px] space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selected?.id === t.id ? "bg-primary/10 font-medium text-primary" : "hover:bg-slate-50"
                }`}
              >
                <div className="font-medium">{NOTIFICATION_EVENT_LABELS[t.event as keyof typeof NOTIFICATION_EVENT_LABELS]}</div>
                <div className="text-xs text-slate-500">
                  {NOTIFICATION_CHANNEL_LABELS[t.channel as keyof typeof NOTIFICATION_CHANNEL_LABELS]}
                </div>
              </button>
            ))}
          </div>
          {selected && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">{selected.name}</h3>
              <p className="text-xs text-slate-500">
                Use {"{{variable}}"} placeholders. Event: {selected.event} · Channel: {selected.channel}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.isActive}
                  onChange={(e) => setSelected({ ...selected, isActive: e.target.checked })}
                />
                Active
              </label>
              {selected.channel === "EMAIL" && (
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={selected.subject ?? ""}
                    onChange={(e) => setSelected({ ...selected, subject: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <Label>Body</Label>
                <Textarea
                  value={selected.body}
                  onChange={(e) => setSelected({ ...selected, body: e.target.value })}
                  rows={12}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "queue" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left">
              <tr>
                <th className="p-3">Event</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Recipient</th>
                <th className="p-3">Status</th>
                <th className="p-3">Attempts</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">Queue is empty.</td></tr>
              ) : (
                queue.map((j) => (
                  <tr key={String(j.id)} className="border-b border-slate-100">
                    <td className="p-3">{String(j.event)}</td>
                    <td className="p-3">{String(j.channel)}</td>
                    <td className="p-3 max-w-[160px] truncate">{String(j.recipient)}</td>
                    <td className="p-3">{String(j.status)}</td>
                    <td className="p-3">{String(j.attempts)}/{String(j.maxAttempts)}</td>
                    <td className="p-3">{new Date(String(j.createdAt)).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "logs" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left">
              <tr>
                <th className="p-3">Event</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Status</th>
                <th className="p-3">Recipient</th>
                <th className="p-3">Error</th>
                <th className="p-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">No logs yet.</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={String(l.id)} className="border-b border-slate-100">
                    <td className="p-3">{String(l.event)}</td>
                    <td className="p-3">{String(l.channel)}</td>
                    <td className="p-3">{String(l.status)}</td>
                    <td className="p-3 max-w-[140px] truncate">{String(l.recipient ?? "—")}</td>
                    <td className="p-3 max-w-[200px] truncate text-red-600">{String(l.error ?? "—")}</td>
                    <td className="p-3">{new Date(String(l.createdAt)).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
