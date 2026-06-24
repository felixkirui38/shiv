import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/about", {
    title: "About Us",
    description:
      "Learn about Shiv Insurance Brokers — licensed IRA insurance advisors with 25+ years of trusted service in Kenya.",
  });
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold">About Shiv Insurance</h1>
      <p className="max-w-3xl text-lg text-muted-foreground">
        Shiv Insurance has been protecting individuals and businesses for over 25
        years. We combine traditional insurance expertise with modern technology
        to deliver seamless coverage, fast claims processing, and exceptional
        customer service.
      </p>
    </div>
  );
}
