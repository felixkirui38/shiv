"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant?: "default" | "accent";
  delay?: number;
}

export function PortalActionCard({
  title,
  description,
  href,
  icon: Icon,
  variant = "default",
  delay = 0,
}: PortalActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={href}
        className={cn(
          "flex items-start gap-4 rounded-2xl border p-5 transition-all",
          variant === "accent"
            ? "border-brand-accent/40 bg-gradient-to-br from-brand-accent/15 to-white hover:shadow-lg hover:shadow-brand-accent/10"
            : "border-brand-border/60 bg-white hover:border-primary/30 hover:shadow-md"
        )}
      >
        <div
          className={cn(
            "rounded-xl p-3",
            variant === "accent" ? "bg-brand-accent text-primary" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="font-heading font-semibold text-dark">{title}</p>
          <p className="mt-0.5 text-sm text-body">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
