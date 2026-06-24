"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PortalPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PortalPageHeader({ title, description, action }: PortalPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-dark md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-body md:text-base">{description}</p>
        )}
      </div>
      {action}
    </motion.div>
  );
}
