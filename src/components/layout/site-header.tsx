"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { MainNav } from "@/components/layout/main-nav";
import {
  HeaderActions,
  HeaderActionsCompact,
} from "@/components/layout/header-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "sticky top-0 z-50 overflow-visible border-b border-white/10 bg-primary text-white transition-shadow duration-300",
        scrolled ? "shadow-lg shadow-black/20" : "shadow-sm"
      )}
    >
      <div className="container mx-auto flex h-14 items-center justify-between gap-3 overflow-visible px-4 md:h-[60px] md:gap-4">
        <Logo size="header" className="-my-2 md:-my-5" />

        <div className="hidden flex-1 justify-center lg:flex">
          <MainNav />
        </div>

        <div className="flex items-center gap-1">
          <HeaderActionsCompact />
          <HeaderActions />
          <MobileNav />
        </div>
      </div>
    </motion.header>
  );
}
