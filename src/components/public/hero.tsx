"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AnimatedSection } from "@/components/shared/animated-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  "Licensed & regulated brokerage",
  "Tailored risk management",
  "Fast claims assistance",
  "Competitive premiums",
];

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-primary lg:block" />
      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <AnimatedSection>
            <div className="accent-bar mb-6" />
            <h1 className="mb-6 font-heading text-4xl font-semibold leading-tight text-dark md:text-5xl lg:text-[3.25rem]">
              Professional Insurance Solutions You Can Trust
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-body">
              Shiv Insurance Brokers delivers comprehensive coverage for motor,
              medical, travel, life, and commercial risks — backed by expert
              advisory and dedicated claims support.
            </p>
            <ul className="mb-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-body">
                  <CheckCircle2 className="size-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className={buttonVariants({ variant: "accent", size: "lg" })}>
                Get a Free Quote
              </Link>
              <Link
                href="/about"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
              >
                Learn About Us
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15} className="relative hidden lg:block">
            <div className="relative ml-auto max-w-md border border-brand bg-brand-light p-8 shadow-lg">
              <div className="absolute -top-3 left-8 h-1.5 w-16 bg-accent" />
              <p className="mb-1 font-heading text-sm font-semibold tracking-wider text-secondary uppercase">
                Why Shiv Insurance
              </p>
              <p className="mb-6 font-heading text-2xl font-semibold text-dark">
                Your Partner in Risk Management
              </p>
              <div className="space-y-4">
                {[
                  { stat: "25+", label: "Years of Excellence" },
                  { stat: "10,000+", label: "Policies Managed" },
                  { stat: "98%", label: "Client Satisfaction" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-b border-brand pb-4 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-body">{item.label}</span>
                    <span className="font-heading text-xl font-semibold text-primary">
                      {item.stat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
