import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/privacy", {
    title: "Privacy Policy",
    description: "Shiv Insurance Brokers privacy policy and data protection practices.",
  });
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground">Our privacy policy.</p>
    </div>
  );
}
