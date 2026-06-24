"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, LayoutGrid } from "lucide-react";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useSiteNavigation } from "@/components/providers/navigation-provider";
import { getIcon } from "@/lib/icons";

const triggerClass =
  "bg-transparent font-heading text-sm font-medium text-white/90 hover:bg-secondary hover:text-white data-popup-open:bg-secondary data-popup-open:text-white";

export function ProductsMegaMenu() {
  const { header } = useSiteNavigation();

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className={triggerClass}>
        Insurance Products
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full min-w-[min(100vw-2rem,680px)] border border-brand bg-white p-4 shadow-lg sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="font-heading text-xs font-semibold tracking-wider text-brand-body uppercase">
              Coverage Solutions
            </p>
            <Link
              href="/products"
              className="flex items-center gap-1 font-heading text-xs font-medium text-secondary hover:underline"
            >
              <LayoutGrid className="size-3.5" />
              All Products
            </Link>
          </div>
          {header.products.length === 0 ? (
            <p className="py-4 text-center text-sm text-body">
              No products available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {header.products.map((product) => {
                const Icon = getIcon(product.icon ?? "shield");
                return (
                  <Link
                    key={product.href}
                    href={product.href}
                    className="group flex items-start gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-brand hover:bg-brand-light hover:shadow-sm"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-sm font-semibold text-dark">
                        {product.label}
                      </p>
                      {product.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-brand-body">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <div className="mt-4 border-t border-brand pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-1 font-heading text-sm font-medium text-secondary hover:underline"
            >
              Compare all insurance products
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
