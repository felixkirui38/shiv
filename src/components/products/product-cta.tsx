import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCtaProps {
  slug: string;
  className?: string;
}

export function ProductCta({ slug, className }: ProductCtaProps) {
  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      <Link
        href={`/products/${slug}/buy`}
        className={buttonVariants({ variant: "accent", size: "lg" })}
      >
        Purchase Insurance
      </Link>
      <Link
        href={`/products/${slug}/buy`}
        className={buttonVariants({ variant: "outline", size: "lg" })}
      >
        Apply Now
      </Link>
      <Link
        href={`/products/${slug}/buy`}
        className={buttonVariants({ variant: "secondary", size: "lg" })}
      >
        Buy Cover
      </Link>
    </div>
  );
}
