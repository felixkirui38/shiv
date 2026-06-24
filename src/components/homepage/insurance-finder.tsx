"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { useHomepage } from "@/components/providers/homepage-provider";
import {
  AnimatedSection,
  SectionHeader,
} from "@/components/homepage/section-primitives";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function InsuranceFinderSection() {
  const { insuranceFinder } = useHomepage();
  const [selected, setSelected] = useState<string | null>(null);

  const match = insuranceFinder.options.find((o) => o.id === selected);

  return (
    <section className="section-light py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <SectionHeader
            title={insuranceFinder.title}
            subtitle={insuranceFinder.subtitle}
          />
        </AnimatedSection>

        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
            {insuranceFinder.options.map((option, i) => {
              const Icon = getIcon(option.icon);
              const isActive = selected === option.id;
              return (
                <AnimatedSection key={option.id} delay={i * 0.05}>
                  <button
                    type="button"
                    onClick={() => setSelected(option.id)}
                    className="w-full text-left"
                  >
                    <Card
                      className={`h-full cursor-pointer border-brand bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                        isActive
                          ? "border-secondary shadow-md ring-2 ring-secondary/20"
                          : "shadow-sm"
                      }`}
                    >
                      <CardContent className="flex flex-col items-center p-5 text-center md:p-6">
                        <div
                          className={`mb-3 flex size-12 items-center justify-center rounded-xl transition-colors ${
                            isActive
                              ? "bg-primary text-white"
                              : "bg-primary/5 text-primary"
                          }`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <p className="font-heading text-sm font-semibold text-dark">
                          {option.label}
                        </p>
                        <p className="mt-1 hidden text-xs text-body sm:block">
                          {option.description}
                        </p>
                      </CardContent>
                    </Card>
                  </button>
                </AnimatedSection>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {match && (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <Card className="border-brand bg-white shadow-md">
                  <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <Search className="size-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-lg font-semibold text-dark">
                        Recommended: {match.label}
                      </p>
                      <p className="mt-1 text-sm text-body">{match.description}</p>
                    </div>
                    <Link
                      href={`/products/${match.productSlug}/buy`}
                      className={cn(buttonVariants({ variant: "accent" }), "gap-2")}
                    >
                      Buy Cover <ArrowRight className="size-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
