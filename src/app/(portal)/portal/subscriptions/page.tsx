"use client";

import { useEffect, useState } from "react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";
import { Button } from "@/components/ui/button";

interface SubscriptionItem {
  id: string;
  status: string;
  provider: string;
  planType: string;
  policyId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INCOMPLETE: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-slate-100 text-slate-600",
  PAST_DUE: "bg-red-100 text-red-800",
  TRIALING: "bg-blue-100 text-blue-800",
};

export default function SubscriptionsPage() {
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      if (data.success) setItems(data.data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this subscription at the end of the billing period?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (data.success) await load();
    } finally {
      setActionId(null);
    }
  }

  async function handleResume(id: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}/resume`, { method: "POST" });
      const data = await res.json();
      if (data.success) await load();
    } finally {
      setActionId(null);
    }
  }

  return (
    <div>
      <PortalPageHeader
        title="Subscriptions"
        description="Manage recurring premium subscriptions."
      />

      {loading ? (
        <PortalLoader />
      ) : items.length === 0 ? (
        <PortalEmptyState
          title="No subscriptions"
          description="Monthly or annual subscription plans will appear here after checkout."
        />
      ) : (
        <div className="space-y-4">
          {items.map((sub) => (
            <PortalCard key={sub.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {sub.provider} · {sub.planType}
                  </p>
                  <p className="mt-1 text-sm text-body">
                    {sub.currentPeriodStart && sub.currentPeriodEnd
                      ? `${new Date(sub.currentPeriodStart).toLocaleDateString()} – ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                      : `Started ${new Date(sub.createdAt).toLocaleDateString()}`}
                  </p>
                  {sub.cancelAtPeriodEnd && (
                    <p className="mt-1 text-xs text-amber-700">Cancels at period end</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[sub.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {sub.status}
                </span>
              </div>
              <div className="mt-4 flex gap-2 border-t border-brand-border/60 pt-4">
                {sub.status !== "CANCELLED" && !sub.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionId === sub.id}
                    onClick={() => handleCancel(sub.id)}
                  >
                    Cancel at period end
                  </Button>
                )}
                {sub.cancelAtPeriodEnd && (
                  <Button
                    size="sm"
                    disabled={actionId === sub.id}
                    onClick={() => handleResume(sub.id)}
                  >
                    Resume subscription
                  </Button>
                )}
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
