"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard } from "@/components/portal/portal-card";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROVIDER_LABELS: Record<string, string> = {
  STRIPE: "Stripe",
  PESAPAL: "Pesapal",
  FLUTTERWAVE: "Flutterwave",
  MPESA: "M-Pesa",
};

export default function PortalPaymentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [payment, setPayment] = useState<{
    type: string;
    planType: string;
    provider: string;
    status: string;
    amount: number;
    currency: string;
    description: string | null;
    paidAt: string | null;
    createdAt: string;
    receiptUrl: string | null;
    receiptNumber: string | null;
    failureReason: string | null;
    installmentNumber: number | null;
    installmentTotal: number | null;
    policy: { id: string; policyNumber: string; status: string } | null;
    order: { id: string; orderNumber: string; status: string } | null;
    invoice: { id: string; invoiceNumber: string; pdfUrl: string | null } | null;
    refunds: { id: string; amount: number; reason: string | null; createdAt: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/payments/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPayment(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="py-16 text-center">
        <p className="text-body">Payment not found.</p>
        <Link href="/portal/payments" className={cn(buttonVariants({ variant: "link" }), "mt-4")}>
          Back to payments
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PortalPageHeader
        title={payment.description ?? payment.type}
        description={`${PROVIDER_LABELS[payment.provider] ?? payment.provider} · ${new Date(payment.paidAt ?? payment.createdAt).toLocaleString()}`}
        action={
          <Link href="/portal/payments" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Back
          </Link>
        }
      />

      <div className="space-y-4">
        <PortalCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="font-heading text-2xl font-semibold text-primary">
              {payment.currency} {payment.amount.toLocaleString()}
            </p>
            <PaymentStatusBadge status={payment.status} />
          </div>
          {payment.failureReason && (
            <p className="mt-2 text-sm text-red-600">{payment.failureReason}</p>
          )}
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Type</dt><dd>{payment.type}</dd></div>
            <div><dt className="text-muted-foreground">Plan</dt><dd>{payment.planType}</dd></div>
            {payment.installmentNumber && payment.installmentTotal && (
              <div>
                <dt className="text-muted-foreground">Installment</dt>
                <dd>{payment.installmentNumber} of {payment.installmentTotal}</dd>
              </div>
            )}
          </dl>
        </PortalCard>

        {(payment.policy || payment.order || payment.invoice) && (
          <PortalCard className="p-5">
            <h3 className="mb-3 font-heading font-semibold text-dark">Related</h3>
            <ul className="space-y-2 text-sm">
              {payment.policy && (
                <li>
                  <Link href={`/portal/policies/${payment.policy.id}`} className="text-primary hover:underline">
                    Policy {payment.policy.policyNumber}
                  </Link>
                </li>
              )}
              {payment.order && (
                <li>
                  <Link href={`/portal/orders/${payment.order.id}`} className="text-primary hover:underline">
                    Order {payment.order.orderNumber}
                  </Link>
                </li>
              )}
              {payment.invoice && (
                <li>
                  Invoice {payment.invoice.invoiceNumber}
                  {payment.invoice.pdfUrl && (
                    <a
                      href={payment.invoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Download className="size-3.5" /> PDF
                    </a>
                  )}
                </li>
              )}
            </ul>
          </PortalCard>
        )}

        {payment.refunds.length > 0 && (
          <PortalCard className="p-5">
            <h3 className="mb-3 font-heading font-semibold text-dark">Refunds</h3>
            <ul className="space-y-2 text-sm">
              {payment.refunds.map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  <span>{payment.currency} {r.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </PortalCard>
        )}

        {payment.receiptUrl && (
          <a
            href={payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), "gap-2")}
          >
            <Download className="size-4" />
            Download receipt {payment.receiptNumber ? `(${payment.receiptNumber})` : ""}
          </a>
        )}
      </div>
    </div>
  );
}
