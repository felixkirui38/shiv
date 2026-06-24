import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Payment Successful | Shiv Insurance" };

export default async function QuoteSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ quote?: string }>;
}) {
  const { quote } = await searchParams;

  return (
    <div className="container mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle className="mx-auto mb-6 size-16 text-accent" />
      <h1 className="mb-3 font-heading text-3xl font-semibold text-dark">
        Thank You!
      </h1>
      <p className="mb-8 text-body">
        Your payment has been received. A Shiv Insurance advisor will contact you
        shortly to finalise your policy.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/portal/dashboard" className={buttonVariants({ variant: "accent" })}>
          Client Portal
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "text-secondary")}
        >
          Back to Home
        </Link>
      </div>
      {quote && (
        <p className="mt-6 text-xs text-muted-foreground">Reference: {quote}</p>
      )}
    </div>
  );
}
