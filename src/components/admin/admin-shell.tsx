"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ADMIN_NAV } from "@/config/admin-nav";
import { brand } from "@/lib/brand";
import { hasPermission } from "@/lib/permissions";
import type { UserRole } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (session?.user?.role ?? "ADMIN") as UserRole;

  const navItems = ADMIN_NAV.filter(
    (item) => !item.permission || hasPermission(role, item.permission)
  );

  const groups = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    const g = item.group ?? "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="shrink-0">
              <Image
                src={brand.logo}
                alt={brand.name}
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
            </Link>
            <div>
              <Link href="/admin/dashboard" className="font-heading text-sm font-bold text-white">
                Shiv CMS
              </Link>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Enterprise</p>
            </div>
          </div>
          <button type="button" className="text-slate-400 md:hidden" onClick={() => setMobileOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-5">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                          active
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        {item.label}
                        {active && <ChevronRight className="ml-auto size-3.5 opacity-60" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="truncate text-xs text-slate-400">{session?.user?.email}</p>
          <p className="text-[10px] uppercase text-slate-500">{role.replace(/_/g, " ")}</p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ExternalLink className="size-3" /> Site
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 py-1.5 text-xs text-slate-400 hover:text-red-400"
            >
              <LogOut className="size-3" /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-md md:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <p className="hidden text-sm text-slate-400 md:block">
            Insurance Operations Console
          </p>
          <Link href="/admin/settings" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800">
            <Bell className="size-5" />
          </Link>
        </header>
        <main className="flex-1 bg-slate-50 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
