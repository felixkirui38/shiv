import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; payment?: string }>;
}) {
  const { order: orderId } = await searchParams;

  let policyId: string | null = null;
  let orderNumber: string | null = null;

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { policy: { select: { id: true, policyNumber: true } } },
    });
    orderNumber = order?.orderNumber ?? null;
    policyId = order?.policy?.id ?? null;
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-20 text-center">
      <div className="accent-bar mx-auto mb-4" />
      <h1 className="mb-3 font-heading text-3xl font-semibold text-primary">
        Payment Successful
      </h1>
      <p className="mb-2 text-body">
        Thank you for purchasing insurance with Shiv Insurance Brokers.
      </p>
      {orderNumber && (
        <p className="mb-6 text-sm text-muted-foreground">Order reference: {orderNumber}</p>
      )}
      <p className="mb-8 text-sm text-body">
        Your policy certificate is being generated and will be emailed to you shortly.
        You can also access it from your customer dashboard.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {policyId ? (
          <Link href={`/portal/policies/${policyId}`} className={buttonVariants({ variant: "accent" })}>
            View Policy
          </Link>
        ) : (
          <Link href="/portal/policies" className={buttonVariants({ variant: "accent" })}>
            Customer Dashboard
          </Link>
        )}
        <Link href="/products" className={buttonVariants({ variant: "outline" })}>
          Browse Products
        </Link>
      </div>
    </div>
  );
}
