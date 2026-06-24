import Link from "next/link";
import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { CredentialsLoginForm } from "@/components/auth/credentials-login-form";

export const metadata = { title: "Login | Shiv Insurance" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const staffOnly = params.admin === "1" || params.callbackUrl?.startsWith("/admin");
  const redirectTo = params.callbackUrl ?? (staffOnly ? "/admin/dashboard" : "/portal/dashboard");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">
        {staffOnly ? "Staff Sign In" : "Sign In"}
      </h1>
      {staffOnly && (
        <p className="mb-6 text-sm text-muted-foreground">
          Access the Shiv Insurance content management system.
        </p>
      )}
      <Suspense fallback={<div className="py-8 text-sm text-muted-foreground">Loading…</div>}>
        <CredentialsLoginForm
          defaultEmail="admin@shivinsbro.co.ke"
          redirectTo={redirectTo}
          staffOnly={staffOnly}
        />
      </Suspense>
      {!staffOnly && <ForgotPasswordForm />}
      {!staffOnly && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      )}
    </div>
  );
}
