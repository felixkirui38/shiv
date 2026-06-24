"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  dueDate: string | null;
  paidAt: string | null;
  pdfUrl: string | null;
  createdAt: string;
  lineItems: { description: string; quantity: number; total: number }[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments/invoices")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setInvoices(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function downloadInvoice(id: string) {
    const res = await fetch(`/api/payments/invoices/${id}/receipt`);
    const data = await res.json();
    if (data.success && data.data.pdfUrl) {
      window.open(data.data.pdfUrl, "_blank");
    }
  }

  return (
    <div>
      <PortalPageHeader
        title="Invoices"
        description="Download invoices and receipts for your insurance payments."
      />

      {loading ? (
        <PortalLoader />
      ) : invoices.length === 0 ? (
        <PortalEmptyState
          title="No invoices yet"
          description="Invoices are generated when payments are completed."
        />
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <PortalCard key={inv.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{inv.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Issued {new Date(inv.createdAt).toLocaleDateString()}
                    {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PaymentStatusBadge status={inv.status} />
                  <p className="font-semibold">
                    {inv.currency} {inv.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {inv.lineItems.length > 0 && (
                <ul className="mt-3 space-y-1 border-t pt-3 text-sm text-muted-foreground">
                  {inv.lineItems.map((line, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{line.description}</span>
                      <span>
                        {inv.currency} {line.total.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4">
                {inv.pdfUrl ? (
                  <a
                    href={inv.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Download className="size-4" />
                    Download invoice
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadInvoice(inv.id)}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Download className="size-4" />
                    Download receipt
                  </button>
                )}
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
