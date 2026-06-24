"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";

interface RenewalPolicy {
  id: string;
  policyNumber: string;
  productName: string;
  premium: number;
  renewalDate: string | null;
  endDate: string | null;
  status: string;
  autoRenew: boolean;
}

const PROVIDERS = [
  { value: "STRIPE", label: "Stripe (Card)" },
  { value: "PESAPAL", label: "Pesapal" },
  { value: "FLUTTERWAVE", label: "Flutterwave" },
  { value: "MPESA", label: "M-Pesa" },
];

export default function RenewalsPage() {
  const [policies, setPolicies] = useState<RenewalPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState<string | null>(null);
  const [provider, setProvider] = useState("STRIPE");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("renewed") === "1") {
      setMessage("Policy renewed successfully. Your payment is being processed.");
    }
    fetch("/api/payments/renewals")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPolicies(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function renewPolicy(policyId: string) {
    setRenewing(policyId);
    setMessage(null);
    try {
      const res = await fetch(`/api/payments/renewals/${policyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, planType: "ANNUAL" }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
        } else if (data.data.message) {
          setMessage(data.data.message);
          setRenewing(null);
        }
      } else {
        setMessage(data.error ?? "Renewal failed");
        setRenewing(null);
      }
    } catch {
      setMessage("Renewal failed");
      setRenewing(null);
    }
  }

  return (
    <div>
      <PortalPageHeader
        title="Policy Renewals"
        description="Renew expiring policies and keep your coverage active."
      />

      {message && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {message}
        </div>
      )}

      <PortalCard className="mb-6 max-w-xs">
        <label className="mb-1 block text-sm font-medium">Payment method</label>
        <Select value={provider} onValueChange={(v) => v && setProvider(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PortalCard>

      {loading ? (
        <PortalLoader />
      ) : policies.length === 0 ? (
        <PortalEmptyState
          title="No renewals due"
          description="No policies due for renewal in the next 60 days."
        />
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <PortalCard
              key={policy.id}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold">{policy.productName}</p>
                <p className="text-sm text-muted-foreground">
                  Policy {policy.policyNumber}
                </p>
                <p className="mt-1 text-sm">
                  Renews{" "}
                  {policy.renewalDate
                    ? new Date(policy.renewalDate).toLocaleDateString()
                    : policy.endDate
                      ? new Date(policy.endDate).toLocaleDateString()
                      : "—"}
                </p>
                <div className="mt-2">
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {policy.status.replace(/_/g, " ")}
                  </span>
                  {policy.autoRenew && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Auto-renew enabled
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="mb-2 text-lg font-semibold">
                  KES {policy.premium.toLocaleString()}
                </p>
                <Button
                  onClick={() => renewPolicy(policy.id)}
                  disabled={renewing === policy.id}
                  className="gap-2"
                >
                  {renewing === policy.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Renew now
                </Button>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
