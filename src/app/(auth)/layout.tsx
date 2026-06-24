import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo size="lg" />
        <p className="text-center text-sm text-muted-foreground">
          Shiv Insurance Brokers · Est. 1995
        </p>
      </div>
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">
        {children}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          ← Back to website
        </Link>
      </p>
    </div>
  );
}
