import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { CareerApplicationForm } from "@/components/public/career-application-form";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/careers", {
    title: "Careers",
    description: "Join Shiv Insurance Brokers — explore career opportunities in insurance.",
  });
}

export default function CareersPage() {
  return (
    <div className="section-light py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <div className="accent-bar mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-semibold text-dark md:text-4xl">Careers</h1>
            <p className="mt-3 text-body">
              Join a licensed insurance brokerage committed to protecting what matters most for Kenyans.
            </p>
          </div>
          <CareerApplicationForm />
        </div>
      </div>
    </div>
  );
}
