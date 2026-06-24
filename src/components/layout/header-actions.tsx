"use client";

import Link from "next/link";
import { AlertTriangle, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteNavigation } from "@/components/providers/navigation-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeaderActions() {
  const { actions } = useSiteNavigation();

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="hidden items-center gap-2 lg:flex"
    >
      <Link
        href={actions.loginHref}
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-heading text-sm font-medium text-white/90 transition-colors hover:bg-secondary hover:text-white"
      >
        <LogIn className="size-4" />
        <span className="hidden xl:inline">{actions.loginLabel}</span>
      </Link>

      <Link
        href={actions.emergencyHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
        )}
      >
        <AlertTriangle className="size-3.5" />
        <span className="hidden xl:inline">{actions.emergencyLabel}</span>
        <span className="xl:hidden">Emergency</span>
      </Link>

      <Link
        href={actions.quoteHref}
        className={buttonVariants({ variant: "accent", size: "default" })}
      >
        {actions.quoteLabel}
      </Link>
    </motion.div>
  );
}

export function HeaderActionsCompact() {
  const { actions } = useSiteNavigation();

  return (
    <div className="hidden items-center gap-2 md:flex lg:hidden">
      <Link
        href={actions.emergencyHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "border-destructive/30 px-2.5 text-destructive"
        )}
        aria-label={actions.emergencyLabel}
      >
        <AlertTriangle className="size-4" />
      </Link>
      <Link
        href={actions.quoteHref}
        className={buttonVariants({ variant: "accent", size: "sm" })}
      >
        {actions.quoteLabel}
      </Link>
    </div>
  );
}
