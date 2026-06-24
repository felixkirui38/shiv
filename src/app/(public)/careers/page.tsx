import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/careers", {
    title: "Careers",
    description: "Join Shiv Insurance Brokers — explore career opportunities in insurance.",
  });
}

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold">Careers</h1>
      <p className="text-muted-foreground">Join our team.</p>
    </div>
  );
}
