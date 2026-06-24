"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";

export default function AdminReportsPage() {
  return (
    <div>
      <AdminPageHeader title="Reports" description="Export data and view financial reports." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/api/admin/payments/export", label: "Payments CSV" },
          { href: "/api/admin/payments/reports", label: "Payment Reports API" },
          { href: "/api/admin/customers?export=csv", label: "Customers CSV" },
          { href: "/api/admin/policies?export=csv", label: "Policies CSV" },
          { href: "/api/admin/applications?export=csv", label: "Applications CSV" },
          { href: "/api/admin/orders?export=csv", label: "Orders CSV" },
          { href: "/api/admin/invoices?export=csv", label: "Invoices CSV" },
          { href: "/api/admin/leads?export=csv", label: "Leads CSV" },
          { href: "/api/admin/audit-logs?export=csv", label: "Audit Logs CSV" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-primary shadow-sm hover:shadow-md"
          >
            {item.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
