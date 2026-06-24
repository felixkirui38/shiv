"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, FolderOpen, Shield } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";

interface DocumentItem {
  id: string;
  name: string;
  type: "policy" | "claim" | "invoice";
  category: string;
  reference: string;
  url: string;
  mimeType: string;
  createdAt: string;
  amount?: number;
  currency?: string;
}

const TYPE_META = {
  policy: { label: "Policy", icon: Shield, color: "text-primary bg-primary/10" },
  claim: { label: "Claim", icon: FileText, color: "text-secondary bg-secondary/10" },
  invoice: { label: "Invoice", icon: FolderOpen, color: "text-brand-accent bg-brand-accent/20" },
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/portal/documents")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDocuments(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? documents : documents.filter((d) => d.type === filter);

  if (loading) return <PortalLoader />;

  return (
    <div>
      <PortalPageHeader
        title="Documents"
        description="All your policy certificates, claim files, and invoices in one place."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "policy", "claim", "invoice"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-white text-body border border-brand-border hover:border-primary/30"
            }`}
          >
            {f === "all" ? "All" : TYPE_META[f as keyof typeof TYPE_META].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <PortalEmptyState
          title="No documents"
          description="Documents from your policies, claims, and invoices will appear here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((doc, i) => {
            const meta = TYPE_META[doc.type];
            const Icon = meta.icon;
            return (
              <motion.div
                key={`${doc.type}-${doc.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <PortalCard className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${meta.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-dark">{doc.name}</p>
                    <p className="text-xs text-body">
                      {meta.label} · {doc.reference} ·{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    {doc.amount != null && (
                      <p className="text-xs font-medium text-primary">
                        {doc.currency} {doc.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-brand-border text-primary hover:bg-brand-light"
                    aria-label="Download"
                  >
                    <Download className="size-4" />
                  </a>
                </PortalCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
