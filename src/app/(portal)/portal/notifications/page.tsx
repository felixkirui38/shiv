"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-page-header";
import { PortalCard, PortalEmptyState, PortalLoader } from "@/components/portal/portal-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/portal/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.data.items);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    await fetch("/api/portal/notifications", { method: "PATCH" });
    load();
  }

  async function markRead(id: string) {
    await fetch(`/api/portal/notifications/${id}`, { method: "PATCH" });
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  const unread = items.filter((n) => !n.isRead).length;

  if (loading) return <PortalLoader />;

  return (
    <div>
      <PortalPageHeader
        title="Notifications"
        description="Stay updated on claims, payments, and policy changes."
        action={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <PortalEmptyState
          title="No notifications"
          description="You're all caught up. We'll notify you when something important happens."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n, i) => {
            const content = (
              <PortalCard
                className={cn(
                  "transition-colors",
                  !n.isRead && "border-primary/20 bg-primary/[0.02]"
                )}
              >
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-4"
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      n.isRead ? "bg-brand-light text-body" : "bg-primary/10 text-primary"
                    )}
                  >
                    <Bell className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-dark">{n.title}</p>
                      <time className="shrink-0 text-xs text-body">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-body">{n.message}</p>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          markRead(n.id);
                        }}
                        className="mt-2 text-xs text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </motion.div>
              </PortalCard>
            );

            return (
              <li key={n.id}>
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => !n.isRead && markRead(n.id)}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
