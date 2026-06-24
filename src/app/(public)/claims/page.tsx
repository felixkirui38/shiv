import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/claims");
}

export default function ClaimsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold">Claims Process</h1>
      <p className="text-muted-foreground">How to file and track your insurance claim.</p>
    </div>
  );
}
