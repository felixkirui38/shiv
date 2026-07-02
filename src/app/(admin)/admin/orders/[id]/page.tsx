"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  insuranceName: string;
  coverageSummary: string | null;
  subtotal: number;
  levies: number;
  taxes: number;
  stampDuty: number;
  totalAmount: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  customer: { name: string; email: string; phone: string | null };
  application: {
    id: string;
    applicationNumber: string;
    status: string;
    productSlug: string;
    productName: string;
  };
  policy: {
    id: string;
    policyNumber: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    description: string | null;
    paidAt: string | null;
    receiptUrl: string | null;
    receiptNumber: string | null;
    failureReason: string | null;
  }[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.data);
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

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600">Order not found.</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-primary hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={order.orderNumber}
        description={`${order.insuranceName} · ${order.customer.name}`}
        action={
          <Link href="/admin/orders">
            <Button variant="outline">Back to list</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-semibold">Payments</h2>
            {order.payments.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No payments recorded for this order.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-left text-slate-500">
                    <tr>
                      <th className="py-2 pr-4">Provider</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.payments.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">{p.provider}</td>
                        <td className="py-3 pr-4">
                          {p.currency} {p.amount.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <PaymentStatusBadge status={p.status} />
                        </td>
                        <td className="py-3">
                          {p.receiptUrl ? (
                            <a
                              href={p.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {p.receiptNumber ?? "PDF"}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium">{order.status.replace(/_/g, " ")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd>{order.currency} {order.subtotal.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Levies</dt>
                <dd>{order.currency} {order.levies.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Taxes</dt>
                <dd>{order.currency} {order.taxes.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Stamp duty</dt>
                <dd>{order.currency} {order.stampDuty.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold">
                <dt>Total</dt>
                <dd>{order.currency} {order.totalAmount.toLocaleString()}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm">
            <h2 className="font-heading text-lg font-semibold">Links</h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/admin/applications/${order.application.id}`}
                  className="text-primary hover:underline"
                >
                  Application {order.application.applicationNumber}
                </Link>
              </li>
              {order.policy && (
                <li>
                  Policy {order.policy.policyNumber} ({order.policy.status})
                </li>
              )}
              <li className="text-slate-600">{order.customer.email}</li>
              {order.coverageSummary && (
                <li className="text-slate-600">Cover: {order.coverageSummary}</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
