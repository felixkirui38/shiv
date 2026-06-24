"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  delay?: number;
  accent?: string;
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  trend,
  delay = 0,
  accent = "from-primary/20 to-primary/5",
}: AdminStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className={cn("mb-3 inline-flex rounded-xl bg-gradient-to-br p-2.5 text-primary", accent)}>
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
    </motion.div>
  );
}
