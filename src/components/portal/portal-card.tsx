"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PortalCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={cn(
        "rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm md:p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function PortalEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-dashed border-brand-border bg-white/50 p-12 text-center"
    >
      <p className="font-heading font-semibold text-dark">{title}</p>
      <p className="mt-2 text-sm text-body">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function PortalLoader() {
  return (
    <div className="flex justify-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="size-8 rounded-full border-2 border-primary border-t-transparent"
      />
    </div>
  );
}
