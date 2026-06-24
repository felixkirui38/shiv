"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PortalLoader } from "@/components/portal/portal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AiAdvisorSettings } from "@/types/ai-advisor";

interface ConversationItem {
  id: string;
  title: string | null;
  sessionId: string;
  messageCount: number;
  user: { email: string; firstName: string | null; lastName: string | null } | null;
  lastMessage: { content: string; role: string; createdAt: string } | null;
  updatedAt: string;
}

interface ConversationDetail {
  id: string;
  title: string | null;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
  user: { email: string; firstName: string | null; lastName: string | null } | null;
}

type Tab = "settings" | "conversations";

export default function AdminAiAdvisorPage() {
  const [tab, setTab] = useState<Tab>("settings");
  const [settings, setSettings] = useState<(AiAdvisorSettings & { hasApiKey?: boolean }) | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/ai-advisor/settings");
    const data = await res.json();
    if (data.success) setSettings(data.data);
  }, []);

  const loadConversations = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/ai-advisor/conversations?${params}`);
    const data = await res.json();
    if (data.success) setConversations(data.data.items ?? []);
  }, [search]);

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/ai-advisor/conversations/${id}`);
    const data = await res.json();
    if (data.success) setSelected(data.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadSettings(), loadConversations()]).finally(() => setLoading(false));
  }, [loadSettings, loadConversations]);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/ai-advisor/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? "Settings saved." : data.error ?? "Save failed");
  };

  if (loading || !settings) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PortalLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="AI Insurance Advisor"
        description="Configure the chat assistant, OpenAI integration, and review customer conversations."
      />

      <div className="flex gap-2 border-b">
        {(["settings", "conversations"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "settings" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border p-6">
            <h2 className="font-semibold">Availability</h2>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              />
              Enable AI advisor
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.showOnPublicSite}
                onChange={(e) => setSettings({ ...settings, showOnPublicSite: e.target.checked })}
              />
              Show chat widget on public site
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.allowGuests}
                onChange={(e) => setSettings({ ...settings, allowGuests: e.target.checked })}
              />
              Allow guest (non-logged-in) users
            </label>

            {!settings.hasApiKey && (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                Set <code className="text-xs">OPENAI_API_KEY</code> in your environment to activate the advisor.
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-lg border p-6">
            <h2 className="font-semibold">OpenAI</h2>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={settings.maxTokens}
                onChange={(e) =>
                  setSettings({ ...settings, maxTokens: Number(e.target.value) || 1200 })
                }
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-6 lg:col-span-2">
            <h2 className="font-semibold">Messaging</h2>
            <div className="space-y-2">
              <Label htmlFor="assistantName">Assistant name</Label>
              <Input
                id="assistantName"
                value={settings.assistantName}
                onChange={(e) => setSettings({ ...settings, assistantName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome message</Label>
              <Textarea
                id="welcomeMessage"
                rows={3}
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemPromptExtra">Extra system instructions</Label>
              <Textarea
                id="systemPromptExtra"
                rows={4}
                value={settings.systemPromptExtra}
                onChange={(e) => setSettings({ ...settings, systemPromptExtra: e.target.value })}
                placeholder="Optional tone, compliance, or product focus notes"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:col-span-2">
            <Button onClick={() => void saveSettings()} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save settings
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        </div>
      )}

      {tab === "conversations" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by title, session, or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline" onClick={() => void loadConversations()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="divide-y rounded-lg border">
              {conversations.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
              )}
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => void loadConversation(c.id)}
                  className={`w-full p-4 text-left hover:bg-muted/50 ${
                    selected?.id === c.id ? "bg-muted" : ""
                  }`}
                >
                  <p className="font-medium">{c.title ?? "Untitled conversation"}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.user?.email ?? c.sessionId} · {c.messageCount} messages ·{" "}
                    {new Date(c.updatedAt).toLocaleString()}
                  </p>
                  {c.lastMessage && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {c.lastMessage.content}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Select a conversation to view messages.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{selected.title ?? "Conversation"}</h3>
                  {selected.user && (
                    <p className="text-xs text-muted-foreground">{selected.user.email}</p>
                  )}
                </div>
                <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg p-3 text-sm ${
                        m.role === "user" ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                        {m.role}
                      </p>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
