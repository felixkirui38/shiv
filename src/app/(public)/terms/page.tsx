import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/terms", {
    title: "Terms of Service",
    description: "Terms and conditions for using Shiv Insurance Brokers services.",
  });
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold">Terms of Service</h1>
      <p className="text-muted-foreground">Terms and conditions.</p>
    </div>
  );
}
