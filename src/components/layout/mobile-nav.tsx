"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
  LogIn,
  Phone,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useSiteNavigation } from "@/components/providers/navigation-provider";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/navigation";

const menuVariants = {
  closed: { x: "100%" },
  open: { x: 0 },
};

const itemVariants = {
  closed: { opacity: 0, x: 20 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.05 + i * 0.04 },
  }),
};

interface MobileNavSectionProps {
  title: string;
  items: NavLink[];
  index: number;
  onNavigate: () => void;
}

function MobileNavSection({
  title,
  items,
  index,
  onNavigate,
}: MobileNavSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div custom={index} variants={itemVariants} className="border-b border-brand">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3.5 font-heading text-sm font-semibold text-dark"
      >
        {title}
        <ChevronDown
          className={cn(
            "size-4 text-brand-body transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-brand-light"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="block border-t border-brand/60 px-6 py-3 text-sm text-brand-body hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { header, actions } = useSiteNavigation();

  const sections = [
    { title: "Insurance Products", items: header.products },
    { title: "Claims", items: header.claims },
    { title: "About", items: header.about },
    { title: "Blog", items: header.blog },
    { title: "Contact", items: header.contact },
  ];

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "text-white hover:bg-secondary hover:text-white lg:hidden"
        )}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] bg-black/40 lg:hidden"
              onClick={close}
            />
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 z-[80] flex h-full w-full max-w-sm flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-brand px-4 py-4">
                <Logo size="header" />
                <button
                  type="button"
                  onClick={close}
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto">
                {sections.map((section, i) => (
                  <MobileNavSection
                    key={section.title}
                    title={section.title}
                    items={section.items}
                    index={i}
                    onNavigate={close}
                  />
                ))}
              </nav>

              <div className="border-t border-brand bg-brand-light p-4">
                <motion.div
                  custom={sections.length}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  className="space-y-2"
                >
                  <a
                    href={`tel:${brand.contact.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 rounded-lg border border-brand bg-white px-4 py-3 text-sm font-medium text-primary shadow-sm"
                  >
                    <Phone className="size-4 text-accent" />
                    {brand.contact.phone}
                  </a>
                  <Link
                    href={actions.emergencyHref}
                    onClick={close}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full gap-2 border-destructive/30 text-destructive"
                    )}
                  >
                    <AlertTriangle className="size-4" />
                    {actions.emergencyLabel}
                  </Link>
                  <Link
                    href={actions.quoteHref}
                    onClick={close}
                    className={cn(buttonVariants({ variant: "accent" }), "w-full")}
                  >
                    {actions.quoteLabel}
                  </Link>
                  <Link
                    href={actions.loginHref}
                    onClick={close}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full gap-2 text-primary"
                    )}
                  >
                    <LogIn className="size-4" />
                    {actions.loginLabel}
                  </Link>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
