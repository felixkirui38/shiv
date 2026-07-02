"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Shield,
  ShoppingBag,
  Repeat,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/brand/logo";

const NAV_ITEMS = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/policies", label: "Policies", icon: Shield },
  { href: "/portal/orders", label: "Orders", icon: ShoppingBag },
  { href: "/portal/claims", label: "Claims", icon: AlertCircle },
  { href: "/portal/renewals", label: "Renewals", icon: RefreshCw },
  { href: "/portal/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/portal/invoices", label: "Invoices", icon: FileText },
  { href: "/portal/payments", label: "Payments", icon: CreditCard },
  { href: "/portal/notifications", label: "Notifications", icon: Bell },
  { href: "/portal/documents", label: "Documents", icon: FolderOpen },
  { href: "/portal/profile", label: "Profile", icon: User },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/portal/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUnread(d.data.unread);
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/80">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-brand-border/60 bg-white/80 px-4 py-3 backdrop-blur-md md:hidden">
        <Logo size="sm" href="/portal/dashboard" />
        <div className="flex items-center gap-2">
          <Link
            href="/portal/notifications"
            className="relative rounded-lg p-2 hover:bg-brand-light"
          >
            <Bell className="size-5 text-primary" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-primary">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 hover:bg-brand-light"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed inset-0 z-30 md:hidden"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="relative h-full w-72 bg-white p-6 shadow-xl">
            <p className="mb-6 font-heading text-sm font-semibold uppercase tracking-wider text-body">
              Customer Portal
            </p>
            <NavLinks pathname={pathname} unread={unread} />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-6 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-body hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </nav>
        </motion.div>
      )}

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-brand-border/40 p-6 md:block">
          <Logo size="md" className="mb-1" />
          <p className="mb-8 text-xs text-body">Customer Portal</p>
          <NavLinks pathname={pathname} unread={unread} />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-8 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-body transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </aside>

        <main className="min-h-screen flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-border/60 bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                  active ? "text-primary" : "text-body"
                )}
              >
                <Icon className={cn("size-5", active && "text-brand-accent")} />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}

function NavLinks({ pathname, unread }: { pathname: string; unread: number }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const showBadge = item.href === "/portal/notifications" && unread > 0;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-body hover:bg-brand-light hover:text-primary"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                    active ? "bg-brand-accent text-primary" : "bg-primary text-white"
                  )}
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
