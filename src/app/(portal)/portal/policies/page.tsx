"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface PolicyItem {
  id: string;
  policyNumber: string;
  status: string;
  productName: string;
  productIcon: string | null;
  premium: number;
  coverageAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  renewalDate: string | null;
  autoRenew: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  RENEWED: "bg-blue-100 text-blue-800",
  EXPIRED: "bg-red-100 text-red-800",
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-slate-100 text-slate-500",
  LAPSED: "bg-orange-100 text-orange-800",
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/policies")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPolicies(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function downloadCertificate(policyId: string) {
    window.open(`/api/portal/policies/${policyId}/certificate`, "_blank");
  }

  if (loading) return <PortalLoader />;

  return (
    <div>
      <PortalPageHeader
        title="My Policies"
        description="View coverage details, renew policies, and download certificates."
      />

      {policies.length === 0 ? (
        <PortalEmptyState
          title="No policies yet"
          description="Once you purchase insurance, your policies will appear here."
          action={
            <Link href="/products" className={buttonVariants({ variant: "default" })}>
              Purchase Insurance
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {policies.map((policy, i) => {
            const Icon = getIcon(policy.productIcon ?? "shield");
            return (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <PortalCard className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-dark">
                          {policy.productName}
                        </p>
                        <p className="text-sm text-body">{policy.policyNumber}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[policy.status] ?? "bg-slate-100 text-slate-600"
                      )}
                    >
                      {policy.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-body">Annual premium</dt>
                      <dd className="font-semibold text-primary">
                        KES {policy.premium.toLocaleString()}
                      </dd>
                    </div>
                    {policy.coverageAmount && (
                      <div>
                        <dt className="text-body">Coverage</dt>
                        <dd className="font-medium">
                          KES {policy.coverageAmount.toLocaleString()}
                        </dd>
                      </div>
                    )}
                    {policy.startDate && (
                      <div>
                        <dt className="text-body">Start</dt>
                        <dd>{new Date(policy.startDate).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {policy.endDate && (
                      <div>
                        <dt className="text-body">End</dt>
                        <dd>{new Date(policy.endDate).toLocaleDateString()}</dd>
                      </div>
                    )}
                  </dl>

                  {policy.autoRenew && (
                    <p className="mt-3 text-xs text-body">
                      <Shield className="mr-1 inline size-3" />
                      Auto-renewal enabled
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-brand-border/50 pt-4">
                    <button
                      type="button"
                      onClick={() => downloadCertificate(policy.id)}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "gap-1.5"
                      )}
                    >
                      <Download className="size-3.5" />
                      Certificate
                    </button>
                    {["ACTIVE", "EXPIRED"].includes(policy.status) && (
                      <Link
                        href="/portal/renewals"
                        className={cn(
                          buttonVariants({ variant: "default", size: "sm" }),
                          "gap-1.5"
                        )}
                      >
                        <RefreshCw className="size-3.5" />
                        Renew
                      </Link>
                    )}
                  </div>
                </PortalCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
