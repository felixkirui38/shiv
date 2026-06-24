"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "primary" | "accent" | "secondary";
  delay?: number;
}

const ACCENT = {
  primary: "from-primary/10 to-primary/5 text-primary",
  accent: "from-brand-accent/20 to-brand-accent/5 text-primary",
  secondary: "from-secondary/10 to-secondary/5 text-secondary",
};

export function PortalStatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "primary",
  delay = 0,
}: PortalStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={cn(
          "mb-4 inline-flex rounded-xl bg-gradient-to-br p-3",
          ACCENT[accent]
        )}
      >
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-body">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-dark">{value}</p>
      {trend && <p className="mt-1 text-xs text-body">{trend}</p>}
      <div className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-primary/[0.03] transition-transform group-hover:scale-150" />
    </motion.div>
  );
}
