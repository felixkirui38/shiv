import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/contact");
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-3 text-4xl font-bold">Contact Us</h1>
        <p className="mb-10 text-muted-foreground">
          Get in touch with our team for quotes, claims support, or general inquiries.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
