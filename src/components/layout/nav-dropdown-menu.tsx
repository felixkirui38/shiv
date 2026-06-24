"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { NavLink } from "@/types/navigation";

const triggerClass =
  "bg-transparent font-heading text-sm font-medium text-white/90 hover:bg-secondary hover:text-white data-popup-open:bg-secondary data-popup-open:text-white";

interface NavDropdownMenuProps {
  label: string;
  items: NavLink[];
  width?: "sm" | "md";
}

export function NavDropdownMenu({
  label,
  items,
  width = "md",
}: NavDropdownMenuProps) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className={triggerClass}>
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`border border-brand bg-white p-3 shadow-lg ${width === "sm" ? "w-64" : "w-80"}`}
        >
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg p-3 transition-colors hover:bg-brand-light"
                >
                  <p className="font-heading text-sm font-semibold text-dark">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-brand-body">
                      {item.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
