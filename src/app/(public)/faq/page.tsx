import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/faq");
}

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold">FAQ</h1>
      <p className="text-muted-foreground">Frequently asked questions.</p>
    </div>
  );
}
