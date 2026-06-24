import Link from "next/link";
import { Phone } from "lucide-react";
import { AnimatedSection } from "@/components/shared/animated-section";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="relative overflow-hidden border border-brand bg-primary px-8 py-14 text-center md:px-16">
            <div className="absolute top-0 left-0 h-1 w-full bg-accent" />
            <h2 className="mb-4 font-heading text-3xl font-semibold text-white md:text-4xl">
              Ready to Protect What Matters?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/80">
              Speak with a Shiv Insurance advisor today and receive a tailored
              insurance proposal for your personal or business needs.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/products" className={buttonVariants({ variant: "accent", size: "lg" })}>
                Get a Free Quote
              </Link>
              <a
                href={`tel:${brand.contact.phone.replace(/\s/g, "")}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 border-white/30 bg-transparent text-white hover:bg-white/10"
                )}
              >
                <Phone className="size-4" />
                {brand.contact.phone}
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
