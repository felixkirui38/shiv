"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Car, Users } from "lucide-react";
import { useHomepage } from "@/components/providers/homepage-provider";
import { AnimatedSection } from "@/components/homepage/section-primitives";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const heroVisuals = [
  {
    id: "business",
    icon: Briefcase,
    bg: "bg-primary",
    position: "top-0 right-0 z-20 h-48 w-56 sm:h-56 sm:w-64",
  },
  {
    id: "family",
    icon: Users,
    bg: "bg-secondary",
    position: "bottom-8 left-0 z-10 h-40 w-48 sm:h-48 sm:w-56",
  },
  {
    id: "vehicle",
    icon: Car,
    bg: "bg-secondary",
    position: "bottom-0 right-8 z-0 h-36 w-44 sm:h-44 sm:w-52",
  },
];

export function HeroSection() {
  const { hero } = useHomepage();

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-brand-light lg:block" />

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-10 py-14 md:gap-12 md:py-20 lg:grid-cols-2 lg:py-24">
          <AnimatedSection direction="left">
            <div className="accent-bar mb-5" />
            <h1 className="mb-5 font-heading text-4xl font-semibold leading-[1.15] text-dark sm:text-5xl lg:text-[3.25rem]">
              {hero.headline}
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-body">
              {hero.subheadline}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                href={hero.primaryButtonHref}
                className={buttonVariants({ variant: "accent", size: "lg" })}
              >
                {hero.primaryButtonLabel}
              </Link>
              <Link
                href={hero.secondaryButtonHref}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2"
                )}
              >
                {hero.secondaryButtonLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.12} className="relative">
            <div className="relative mx-auto h-[340px] w-full max-w-md sm:h-[400px] lg:ml-auto lg:max-w-lg">
              {hero.images.map((img, i) => {
                const visual = heroVisuals.find((v) => v.id === img.id) ?? heroVisuals[i];
                const Icon = visual?.icon ?? Briefcase;
                return (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={cn(
                      "absolute overflow-hidden rounded-xl border border-brand shadow-lg",
                      visual?.position
                    )}
                  >
                    {img.imageUrl ? (
                      <Image
                        src={img.imageUrl}
                        alt={img.alt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex h-full w-full flex-col items-center justify-end p-4 text-white",
                          visual?.bg
                        )}
                      >
                        <Icon className="mb-auto mt-6 size-10 opacity-40" />
                        <p className="font-heading text-sm font-semibold">
                          {img.label}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div className="absolute -bottom-2 left-1/2 z-30 -translate-x-1/2 rounded-full border border-brand bg-white px-5 py-2 shadow-md">
                <p className="font-heading text-xs font-semibold text-primary">
                  Licensed Insurance Broker
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
