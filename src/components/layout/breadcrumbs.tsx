"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABEL_MAP: Record<string, string> = {
  products: "Insurance Products",
  about: "About Us",
  claims: "Claims",
  blog: "Blog",
  contact: "Contact",
  careers: "Careers",
  faq: "FAQ",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  login: "Customer Login",
  register: "Register",
  apply: "Apply Online",
  quote: "Request Quote",
  success: "Payment Successful",
  "motor-insurance": "Motor Insurance",
  "medical-insurance": "Medical Insurance",
  "travel-insurance": "Travel Insurance",
  "life-insurance": "Life Insurance",
  "home-insurance": "Home Insurance",
  "business-insurance": "Business Insurance",
  "marine-insurance": "Marine Insurance",
};

function formatSegment(segment: string): string {
  return (
    LABEL_MAP[segment] ??
    segment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = formatSegment(segment);
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <div className="border-b border-brand bg-brand-light">
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href="/" className="flex items-center gap-1 text-brand-body hover:text-primary" />}
              >
                <Home className="size-3.5" />
                <span className="sr-only sm:not-sr-only">Home</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.map((crumb) => (
              <Fragment key={crumb.href}>
                <BreadcrumbSeparator>
                  <ChevronRight className="size-3.5 text-brand-body" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="font-heading text-sm font-medium text-primary">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={
                        <Link
                          href={crumb.href}
                          className="font-heading text-sm text-brand-body hover:text-primary"
                        />
                      }
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
