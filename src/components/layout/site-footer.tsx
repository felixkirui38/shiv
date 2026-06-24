"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SocialIcon } from "@/components/brand/social-icons";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { FooterCurrencySelector } from "@/components/layout/footer-currency-selector";
import { Separator } from "@/components/ui/separator";
import { useSiteNavigation } from "@/components/providers/navigation-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { FooterLicenseTrigger } from "@/components/layout/footer-license-trigger";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <CurrencyProvider>
      <SiteFooterContent />
    </CurrencyProvider>
  );
}

function SiteFooterContent() {
  const { footer } = useSiteNavigation();

  return (
    <footer className="border-t border-brand bg-primary text-white">
      <div className="container mx-auto px-4 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Company Information */}
          <div className="lg:col-span-4">
            <Logo variant="light" size="lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              {footer.companyDescription}
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/80">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                {brand.contact.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-accent" />
                <a
                  href={`tel:${brand.contact.phone.replace(/\s/g, "")}`}
                  className="hover:text-accent"
                >
                  {brand.contact.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-accent" />
                <a href={`mailto:${brand.contact.email}`} className="hover:text-accent">
                  {brand.contact.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-accent" />
                Mon – Fri: 8:00 AM – 5:00 PM
              </p>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-2">
              {footer.social.map((social) => (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80 transition-all hover:border-accent hover:bg-accent hover:text-primary"
                  >
                    <SocialIcon platform={social.platform} className="size-4" />
                  </a>
                ))}
            </div>
          </div>

          {/* Link columns */}
          {footer.columns.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <h4 className="mb-4 font-heading text-sm font-semibold tracking-wide text-accent uppercase">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <NewsletterForm config={footer.newsletter} />
          </div>
        </div>

        <Separator className="my-8 bg-white/15 md:my-10" />

        <div className="mb-4 flex justify-center md:justify-end">
          <FooterCurrencySelector />
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-3 text-center text-sm text-white/60 md:flex-row md:text-left">
          <p>
            &copy; {new Date().getFullYear()} {footer.copyright}
          </p>
          <FooterLicenseTrigger
            license={footer.license}
            className="cursor-default text-sm text-white/60 transition-colors hover:text-white/80"
          />
        </div>
      </div>
    </footer>
  );
}
